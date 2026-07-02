import AppShell from "@/components/AppShell";

export default function ObligationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell breadcrumb="Obligations">{children}</AppShell>;
}
