"use client";

export default function AppFooter() {
  return (
    <footer className="mb-[calc(96px+env(safe-area-inset-bottom))] mt-4 w-full px-4 md:mb-8">
      <p className="text-center text-white/40 text-xs">
        © {new Date().getFullYear()} Luxorides
      </p>
    </footer>
  );
}
