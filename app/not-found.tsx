"use client";

import LinkComponent from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-lime-500 selection:text-black">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[350px] w-[350px] rounded-full bg-lime-500/5 blur-[120px]" />
        
        <h1 className="text-8xl font-black tracking-tight text-lime-400">404</h1>
        <h2 className="text-2xl font-bold mt-4">Audit Endpoint Not Found</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">
          The page or stack report you are looking for has either expired or been relocated.
        </p>
        
        <LinkComponent
          href="/"
          className="mt-8 rounded-xl bg-lime-400 px-6 py-3 text-xs font-bold text-black hover:bg-lime-300 transition-all active:scale-[0.98]"
        >
          Return to Home
        </LinkComponent>
      </main>
      <Footer />
    </div>
  );
}
