import { notFound } from "next/navigation";
import { getEtablissementById } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import EtablissementDetailView from "./_components/EtablissementDetailView";

export default async function EtablissementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etab = await getEtablissementById(decodeURIComponent(id));
  if (!etab) notFound();

  return <EtablissementDetailView data={serialize(etab)} />;
}
