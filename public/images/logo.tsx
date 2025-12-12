import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1410] text-amber-200 flex flex-col items-center justify-center px-6 py-20">
      
      <div className="flex flex-col items-center text-center max-w-2xl">

        {/* --- Logo --- */}
        <Image
          src="/images/tavern-logo.png"
          alt="Tavern Logo"
          width={260}
          height={260}
          className="drop-shadow-xl mb-6"
          priority
        />

        {/* --- Title --- */}
        <h1 className="text-5xl font-bold tracking-wide mb-4 text-amber-300">
          Welcome to Tavern
        </h1>

        {/* --- Subtitle --- */}
        <p className="text-lg text-amber-200/90 leading-relaxed mb-8">
          A home between campaigns. Create your characters, join adventures,
          and gather around the table with your party — anywhere, anytime.
        </p>

        {/* --- Buttons --- */}
        <div className="flex gap-4 mt-4">
          <a
            href="/register"
            className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold transition"
          >
            Get Started
          </a>

          <a
            href="/login"
            className="px-6 py-3 rounded-lg border border-amber-400 text-amber-200 hover:bg-amber-400 hover:text-black font-semibold transition"
          >
            Log In
          </a>
        </div>

      </div>
    </main>
  );
}
