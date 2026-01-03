import { Navbar } from "@/app/components/nav";
import Footer from "@/app/components/footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl mx-4 mt-8 sm:mx-auto">
      <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
        <Navbar />
        {children}
        <Footer />
      </main>
    </div>
  );
}
