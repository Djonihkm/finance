import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NouveauBonForm from "./_components/NouveauBonForm";

export default async function NouveauBonPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const etablissement = session.etablissementId
    ? await prisma.etablissement.findUnique({
        where: { id: session.etablissementId },
        select: { adresse: true, ville: true, region: true },
      })
    : null;

  return <NouveauBonForm etablissement={etablissement} />;
}
