import './globals.css';

export const metadata = {
  title: 'ADYTUM: Dynamic Multi-Agent 8-Bit Narrative Engine',
  description: 'Closed-Loop Multi-Agent Interactive Fiction Engine powered by Gemini & IEEE 4-Agent Architecture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0f380f] text-[#e0f8d0] min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
