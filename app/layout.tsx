import "@/app/global.css";
import type { Metadata } from "next";
import { inter } from "@/app/fonts";
import { Navbar } from "@/app/components/nav";
import Footer from "@/app/components/footer";
import { baseUrl } from "@/app/sitemap";
import { cn } from "@/lib/utils";

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
      className={cn("h-full w-full !cursor-default", inter.className)}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 sm:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
