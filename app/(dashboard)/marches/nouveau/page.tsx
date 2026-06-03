import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NouveauMarcheForm from "./_components/NouveauMarcheForm";

export default async function NouveauMarchePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const allowed = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
  if (!allowed.includes(session.role)) redirect("/marches");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Nouveau marché</h1>
        <p className="text-sm text-gray-500 mt-1">Créez un nouveau marché fournisseur</p>
      </div>
      <NouveauMarcheForm />
    </div>
  );
}
