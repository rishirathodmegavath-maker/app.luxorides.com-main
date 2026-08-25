// app/auth/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100dvh-var(--safe-top)-var(--safe-bottom))] min-h-0 items-center justify-center overflow-hidden px-5 py-3">
      {children}
    </div>
  );
}
