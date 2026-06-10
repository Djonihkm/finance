import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import JournalView from "./_components/JournalView";

const CAN_VIEW = ["SUPER_ADMIN", "MINISTERE", "DIRECTEUR", "ADMIN"];

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!CAN_VIEW.includes(session.role)) redirect("/");

  return (
    <JournalView
      userPrismaRole={session.role}
      etablissementId={session.etablissementId ?? ""}
    />
  );
}
