import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDepenseByReference } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import ModifierDepenseForm from "./_components/ModifierDepenseForm";

export default async function ModifierDepensePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const session = await getSession();

  if (!session || (session.role !== "COMPTABLE" && session.role !== "ADMIN")) {
    redirect(`/depensesEtablissement/${reference}`);
  }

  const depense = await getDepenseByReference(decodeURIComponent(reference));
  if (!depense) notFound();

  if (depense.statut !== "REVISION" && depense.statut !== "ATTENTE") {
    redirect(`/depensesEtablissement/${reference}`);
  }

  return <ModifierDepenseForm data={serialize(depense)} />;
}
