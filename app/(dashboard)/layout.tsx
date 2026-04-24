import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RoleProvider } from "@/lib/role-context";
import DashboardLayout from "@/app/components/DashboardLayout";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <RoleProvider role={session.uiRole}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleProvider>
  );
}
