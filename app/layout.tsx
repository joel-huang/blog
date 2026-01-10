import "@/app/global.css";
import type { Metadata } from "next";
import Script from "next/script";
import { inter } from "@/app/fonts";
import { baseUrl } from "@/app/sitemap";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/app/providers/theme-provider";

const description = "Joel Huang - Head of AI & Product at Bifrost AI. Insights on product, business, technology, synthetic data, autonomous systems, computer vision, and robotics."

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
      <meta name="google-site-verification" content="XR4zQHYHGVFkRbQipXF12clDdWgUmO0bj_qYr-OdyyU" />
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Joel Huang",
            "url": "https://joelhuang.dev",
            "sameAs": [
              "https://www.linkedin.com/in/joel-huang",
              "https://x.com/joelhuang",
              "https://github.com/joel-huang"
            ],
            "jobTitle": "Head of AI & Product",
            "worksFor": {
              "@type": "Organization",
              "name": "Bifrost AI",
              "url": "https://bifrost.ai"
            }
          })
        }}
      />
      <body className="antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
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
