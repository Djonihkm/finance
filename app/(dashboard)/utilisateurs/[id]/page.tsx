import { notFound } from "next/navigation";
import { getUserById } from "@/lib/queries";
import UtilisateurDetailView from "./_components/UtilisateurDetailView";

export default async function UtilisateurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  return <UtilisateurDetailView data={user} />;
}
