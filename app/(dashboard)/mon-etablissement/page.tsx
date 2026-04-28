import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getEtablissementById } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import MonEtablissementView from "./_components/MonEtablissementView";

export default async function MonEtablissementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.etablissementId) redirect("/etablissements");

  const etab = await getEtablissementById(session.etablissementId);
  if (!etab) redirect("/login");

  const canEdit = session.role === "ADMIN";

  return (
    <MonEtablissementView
      etab={serialize(etab)}
      canEdit={canEdit}
    />
  );
}
