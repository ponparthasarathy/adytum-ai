/**
 * Provider-Agnostic LLM Calling Layer
 * Supports Groq, Mistral, Gemini, and xAI with JSON enforcement and multi-provider fallback.
 */

const PROVIDER_CONFIGS = {
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'openai/gpt-oss-120b',
    fallbackModels: ['qwen/qwen3.6-27b', 'openai/gpt-oss-20b'],
    getHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatBody: (model, systemPrompt, messages) => {
      const formattedMessages = [];
      if (systemPrompt) {
        formattedMessages.push({ role: 'system', content: systemPrompt });
      }
      formattedMessages.push(...messages);
      return {
        model,
        messages: formattedMessages,
        response_format: { type: 'json_object' },
        temperature: 0.7
      };
    },
    parseResponse: (data) => data.choices?.[0]?.message?.content
  },

  mistral: {
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-small-latest',
    getHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatBody: (model, systemPrompt, messages) => {
      const formattedMessages = [];
      if (systemPrompt) {
        formattedMessages.push({ role: 'system', content: systemPrompt });
      }
      formattedMessages.push(...messages);
      return {
        model,
        messages: formattedMessages,
        response_format: { type: 'json_object' },
        temperature: 0.7
      };
    },
    parseResponse: (data) => data.choices?.[0]?.message?.content
  },

  xai: {
    endpoint: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-2-latest',
    getHeaders: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatBody: (model, systemPrompt, messages) => {
      const formattedMessages = [];
      if (systemPrompt) {
        formattedMessages.push({ role: 'system', content: systemPrompt });
      }
      formattedMessages.push(...messages);
      return {
        model,
        messages: formattedMessages,
        response_format: { type: 'json_object' },
        temperature: 0.7
      };
    },
    parseResponse: (data) => data.choices?.[0]?.message?.content
  },

  gemini: {
    endpoint: (model, apiKey) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    defaultModel: 'gemini-3.6-flash',
    getHeaders: () => ({ 'Content-Type': 'application/json' }),
    formatBody: (model, systemPrompt, messages) => {
      const contents = [];
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}` }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: 'Understood. I will strictly follow all instructions and return structured JSON.' }]
        });
      }
      messages.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
      return {
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      };
    },
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text
  }
};

/**
 * Clean and parse JSON from LLM text output safely
 */
function cleanAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or invalid LLM response');
  }

  let text = rawText.trim();
  // Strip markdown code fences if present
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Attempt extracting the first JSON object {}
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const extracted = text.substring(startIdx, endIdx + 1);
      return JSON.parse(extracted);
    }
    throw new Error(`Failed to parse JSON from output: ${text.substring(0, 100)}...`);
  }
}

/**
 * Call an LLM with fallback support across configured providers
 */
export async function callLLM({
  provider = 'groq',
  model = null,
  systemPrompt = '',
  messages = [],
  fallbackProviders = ['mistral', 'groq']
}) {
  const providersToTry = [provider, ...fallbackProviders.filter(p => p !== provider)];

  let lastError = null;

  for (const prov of providersToTry) {
    const config = PROVIDER_CONFIGS[prov];
    if (!config) continue;

    let apiKey = '';
    if (prov === 'groq') apiKey = process.env.GROQ_API_KEY;
    else if (prov === 'mistral') apiKey = process.env.MISTRAL_API_KEY;
    else if (prov === 'gemini') apiKey = process.env.GEMINI_API_KEY;
    else if (prov === 'xai') apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      continue;
    }

    const modelsToTry = [
      (prov === provider && model) ? model : config.defaultModel,
      ...(config.fallbackModels || [])
    ];

    for (const targetModel of modelsToTry) {
      const endpoint = typeof config.endpoint === 'function'
        ? config.endpoint(targetModel, apiKey)
        : config.endpoint;

      try {
        const headers = config.getHeaders(apiKey);
        const body = config.formatBody(targetModel, systemPrompt, messages);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Provider ${prov} (model ${targetModel}) returned HTTP ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = await response.json();
        const rawContent = config.parseResponse(data);

        if (!rawContent) {
          throw new Error(`Provider ${prov} returned empty response`);
        }

        const parsed = cleanAndParseJSON(rawContent);
        return {
          success: true,
          provider: prov,
          model: targetModel,
          data: parsed,
          rawText: rawContent
        };
      } catch (err) {
        lastError = err;
        console.warn(`[callLLM] Provider ${prov} model ${targetModel} failed:`, err.message);
      }
    }
  }

  // If all online providers fail, return structured fallback indication
  return {
    success: false,
    error: lastError ? lastError.message : 'No available LLM providers configured',
    data: null
  };
}
