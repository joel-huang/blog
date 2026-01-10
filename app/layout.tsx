import "@/app/global.css";
import type { Metadata } from "next";
import { inter } from "@/app/fonts";
import { baseUrl } from "@/app/sitemap";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/app/providers/theme-provider";

const description = "Thinking in public";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Joel Huang",
    template: "%s | Joel Huang",
  },
  description: description,
  openGraph: {
    title: "Joel Huang",
    description: description,
    url: baseUrl,
    siteName: "joelhuang.dev",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og?title=${encodeURIComponent("Joel Huang")}`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      translate="no"
      className={cn("h-full w-full !cursor-default", inter.className)}
      suppressHydrationWarning
    >
      <meta name="google" content="notranslate" />
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storageKey = 'theme-preference';
                  const stored = localStorage.getItem(storageKey);
                  let theme;
                  
                  if (stored && (stored === 'light' || stored === 'dark')) {
                    theme = stored;
                  } else {
                    // First visit: use system preference and store it
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    localStorage.setItem(storageKey, theme);
                  }
                  
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider storageKey="theme-preference">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
