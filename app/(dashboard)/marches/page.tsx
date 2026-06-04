import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMarches, getContrats } from "@/lib/queries";
import MarchesView from "./_components/MarchesView";

export default async function MarchesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const etabId = session.etablissementId ?? "";
  const [marches, contrats] = etabId
    ? await Promise.all([getMarches(etabId), getContrats(etabId)])
    : [[], []];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Marchés & Contrats</h1>
        <p className="text-sm text-gray-500 mt-1">Suivi des marchés fournisseurs et des contrats</p>
      </div>
      <MarchesView
        marches={JSON.parse(JSON.stringify(marches))}
        contrats={JSON.parse(JSON.stringify(contrats))}
        userPrismaRole={session.role}
      />
    </div>
  );
}
