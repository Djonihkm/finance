import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PlanComptableView from "./_components/PlanComptableView";

export default async function PlanComptablePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/");

  const classes = await prisma.classe.findMany({
    orderBy: { numero: "asc" },
    include: {
      comptes: {
        where: { parentId: null },
        orderBy: { numero: "asc" },
        include: {
          enfants: { orderBy: { numero: "asc" } },
          _count: {
            select: {
              depensesCharge: true, bonsCharge: true,
              ecritures: true, entreesProduitsCompte: true,
              entreesTresorerie: true,
            },
          },
        },
      },
    },
  });

  return <PlanComptableView classes={JSON.parse(JSON.stringify(classes))} />;
}
