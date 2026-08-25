import ClientRoot from "./ClientRoot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientRoot>{children}</ClientRoot>
  );
}
