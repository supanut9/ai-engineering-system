import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hello Todo — Next.js",
  description: "Canonical todo reference app for ai-engineering-system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
        {children}
      </body>
    </html>
  );
}
