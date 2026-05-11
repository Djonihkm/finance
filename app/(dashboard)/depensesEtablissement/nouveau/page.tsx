import NouvelleDepenseForm from "./NouvelleDepenseForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  const comptes = await prisma.compte.findMany({
    where: { numero: { startsWith: "6" } },
    orderBy: { numero: "asc" },
    select: { id: true, numero: true, nom: true },
  });

  return <NouvelleDepenseForm comptes={comptes} />;
}