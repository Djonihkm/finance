import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/queries";
import ProfilView from "./_components/ProfilView";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

  return <ProfilView user={user} userId={session.userId} />;
}
