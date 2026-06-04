import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getFournisseurs } from "@/lib/queries";
import FournisseursView from "./_components/FournisseursView";

export default async function FournisseursPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const etabId = session.etablissementId ?? "";
  const fournisseurs = etabId ? await getFournisseurs(etabId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Fournisseurs</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez les fournisseurs de votre établissement</p>
      </div>
      <FournisseursView fournisseurs={JSON.parse(JSON.stringify(fournisseurs))} userPrismaRole={session.role} />
    </div>
  );
}
