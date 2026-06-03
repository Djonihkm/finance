import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NouveauFournisseurForm from "./_components/NouveauFournisseurForm";

export default async function NouveauFournisseurPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "DIRECTEUR") redirect("/fournisseurs");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Nouveau fournisseur</h1>
        <p className="text-sm text-gray-500 mt-1">Enregistrez un nouveau fournisseur pour votre établissement</p>
      </div>
      <NouveauFournisseurForm />
    </div>
  );
}
