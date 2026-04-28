import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBonByReference } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import ModifierBonForm from "./_components/ModifierBonForm";

export default async function ModifierBonPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const session = await getSession();

  if (!session || (session.role !== "COMPTABLE" && session.role !== "ADMIN")) {
    redirect(`/depensesEtablissement/bons/${reference}`);
  }

  const bon = await getBonByReference(decodeURIComponent(reference));
  if (!bon) notFound();

  if (bon.statut !== "REVISION" && bon.statut !== "ATTENTE") {
    redirect(`/depensesEtablissement/bons/${reference}`);
  }

  return <ModifierBonForm data={serialize(bon)} />;
}
