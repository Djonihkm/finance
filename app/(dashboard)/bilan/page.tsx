import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllDepenses, getDepenses, getBudgets } from "@/lib/queries";
import { formatMontant, formatDate, formatCategorie, formatPaiement, STATUT_COLORS, formatStatut } from "@/lib/utils/formatters";

export default async function BilanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "SUPER_ADMIN" || session.role === "MINISTERE";

  const [depenses, budgets] = await Promise.all([
    isAdmin ? getAllDepenses() : getDepenses(session.etablissementId!),
    getBudgets(isAdmin ? undefined : { etablissementId: session.etablissementId! }),
  ]);

  const totalDepenses = depenses.reduce(
    (sum, d) => sum + parseFloat(d.montant.toString()),
    0
  );
  const totalBudget = budgets.reduce(
    (sum, b) => sum + parseFloat(b.montantTotal.toString()),
    0
  );
  const totalConsomme = budgets.reduce(
    (sum, b) => sum + parseFloat(b.montantConsomme.toString()),
    0
  );
  const solde = totalBudget - totalConsomme;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-[#11355b]">Bilan</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Dépenses</p>
            <p className="text-2xl font-bold text-[#11355b]">{formatMontant(totalDepenses)}</p>
            <p className="text-xs text-gray-400 mt-1">{depenses.length} document(s)</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Consommé</p>
            <p className="text-2xl font-bold text-[#e63946]">{formatMontant(totalConsomme)}</p>
            <p className="text-xs text-gray-400 mt-1">sur {formatMontant(totalBudget)} alloués</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-[#11355b] p-6 rounded-xl shadow-lg flex justify-between items-center text-white">
          <div>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Solde Disponible</p>
            <p className="text-2xl font-bold">{formatMontant(solde)}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Tableau des dépenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#11355b]">Journal des dépenses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#11355b] text-white text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-white/10">Référence</th>
                <th className="px-6 py-4 border-r border-white/10">Établissement</th>
                <th className="px-6 py-4 border-r border-white/10 text-center">Date</th>
                <th className="px-6 py-4 border-r border-white/10">Libellé</th>
                <th className="px-6 py-4 border-r border-white/10">Catégorie</th>
                <th className="px-6 py-4 border-r border-white/10 text-center">Statut</th>
                <th className="px-6 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {depenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              ) : (
                depenses.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{d.reference}</td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-[140px] truncate">
                      {d.etablissement.nom}
                    </td>
                    <td className="px-6 py-4 text-center text-xs">{formatDate(d.date)}</td>
                    <td className="px-6 py-4 text-xs leading-relaxed max-w-[180px] truncate">{d.intitule}</td>
                    <td className="px-6 py-4 text-xs">{formatCategorie(d.categorie)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUT_COLORS[d.statut]}`}>
                        {formatStatut(d.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#11355b]">
                      {formatMontant(parseFloat(d.montant.toString()))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {depenses.length > 0 && (
              <tfoot className="bg-[#11355b] text-white">
                <tr>
                  <td colSpan={6} className="px-6 py-5 text-right font-bold uppercase tracking-widest text-sm">
                    Total général
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-lg border-l border-white/10">
                    {formatMontant(totalDepenses)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Récapitulatif budgets */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#11355b]">Récapitulatif budgets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Établissement</th>
                  <th className="px-6 py-4">Année</th>
                  <th className="px-6 py-4 text-right">Alloué</th>
                  <th className="px-6 py-4 text-right">Consommé</th>
                  <th className="px-6 py-4 text-right">Solde</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const total = parseFloat(b.montantTotal.toString());
                  const conso = parseFloat(b.montantConsomme.toString());
                  return (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold text-[#11355b]">{b.etablissement.nom}</td>
                      <td className="px-6 py-4 text-gray-500">{b.annee}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#11355b]">{formatMontant(total)}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${conso / total > 0.8 ? "text-red-500" : "text-emerald-600"}`}>
                        {formatMontant(conso)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatMontant(total - conso)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
