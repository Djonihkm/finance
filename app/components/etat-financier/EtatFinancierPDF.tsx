import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { formatMontant, formatDate } from "@/lib/utils/formatters";

const navy = "#11355b";
const gray100 = "#f3f4f6";
const gray200 = "#e5e7eb";
const gray500 = "#6b7280";
const gray600 = "#4b5563";
const emerald = "#059669";
const red = "#dc2626";
const white = "#ffffff";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
    paddingTop: 36,
    paddingBottom: 70,
    paddingHorizontal: 36,
  },

  /* ── En-tête ── */
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `2pt solid ${navy}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: navy,
  },
  subtitle: {
    fontSize: 11,
    color: gray500,
    marginTop: 3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerRightLabel: {
    fontSize: 9,
    color: gray500,
  },
  headerRightValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: navy,
    marginTop: 2,
  },

  /* ── KPIs ── */
  kpiRow: {
    flexDirection: "row",
    marginBottom: 20,
    border: `1pt solid ${gray200}`,
    borderRadius: 4,
    overflow: "hidden",
  },
  kpiItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRight: `1pt solid ${gray200}`,
  },
  kpiItemLast: {
    borderRight: "none",
  },
  kpiItemNavy: {
    backgroundColor: navy,
  },
  kpiLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: gray500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiLabelNavy: {
    color: "rgba(255,255,255,0.6)",
  },
  kpiValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: navy,
  },
  kpiSub: {
    fontSize: 8,
    color: gray500,
    marginTop: 3,
  },
  kpiSubNavy: {
    color: "rgba(255,255,255,0.5)",
  },

  /* ── Section ── */
  sectionBlock: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: navy,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 9,
    color: gray500,
    marginBottom: 8,
  },

  /* ── Tableau classique ── */
  table: {
    border: `1pt solid ${gray200}`,
    borderRadius: 4,
    overflow: "hidden",
  },
  thead: {
    flexDirection: "row",
    backgroundColor: navy,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: white,
    textTransform: "uppercase",
  },
  dataRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTop: `0.5pt solid ${gray100}`,
  },
  dataRowAlt: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    fontSize: 10,
    color: gray600,
  },
  cellMono: {
    fontFamily: "Courier",
    fontSize: 9,
    color: gray500,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: gray100,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTop: `1pt solid ${gray200}`,
  },
  totalLabel: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: gray600,
    textTransform: "uppercase",
    textAlign: "right",
    paddingRight: 10,
  },
  totalVal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    width: 110,
    textAlign: "right",
  },

  /* Trésorerie */
  tresGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTop: `1pt solid ${gray200}`,
  },
  tresGroupLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: navy,
    textTransform: "uppercase",
  },
  tresGroupSolde: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tresSummary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTop: `0.5pt solid ${gray200}`,
    gap: 20,
  },
  tresSummaryText: {
    fontSize: 9,
    color: gray500,
  },

  /* Colonnes tableau trésorerie */
  cDate:  { width: 72 },
  cLib:   { flex: 1 },
  cMt:    { width: 110, textAlign: "right" },

  /* Colonnes tableau charges/produits */
  cNum:   { width: 60 },
  cNom:   { flex: 1 },
  cTotal: { width: 120, textAlign: "right" },

  /* ── Pied de page ── */
  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
  },
  footerLine: {
    borderTop: `1pt solid ${gray200}`,
    marginBottom: 10,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerNote: {
    fontSize: 8,
    color: gray500,
  },
  signatureBox: {
    width: 150,
    height: 60,
    border: `1pt solid ${gray200}`,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: gray500,
    textAlign: "center",
  },
});

export function EtatFinancierPDFDocument({
  etat,
  annee,
}: {
  etat: EtatFinancier;
  annee: number;
}) {
  const now = new Date();
  const exportDate = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const exportHour = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const resultatPositif = etat.resultat > 0;
  const resultatNul = etat.resultat === 0;
  const soldePositif = etat.soldeTresorerie > 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>État Financier</Text>
            <Text style={s.subtitle}>Synthèse financière de l'exercice {annee}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerRightLabel}>Exercice fiscal</Text>
            <Text style={s.headerRightValue}>{annee}</Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={s.kpiRow}>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Total Entrées</Text>
            <Text style={[s.kpiValue, { color: emerald }]}>{formatMontant(etat.totalEntrees)}</Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Total Charges</Text>
            <Text style={[s.kpiValue, { color: red }]}>{formatMontant(etat.totalCharges)}</Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Solde Trésorerie</Text>
            <Text style={[s.kpiValue, { color: soldePositif ? emerald : red }]}>
              {formatMontant(etat.soldeTresorerie)}
            </Text>
            <Text style={s.kpiSub}>{soldePositif ? "Disponible" : "Insuffisant"}</Text>
          </View>
          <View style={[s.kpiItem, s.kpiItemLast, resultatPositif ? s.kpiItemNavy : {}]}>
            <Text style={[s.kpiLabel, resultatPositif ? s.kpiLabelNavy : {}]}>Résultat</Text>
            <Text style={[
              s.kpiValue,
              resultatPositif
                ? { color: white }
                : { color: resultatNul ? gray500 : red },
            ]}>
              {resultatPositif ? "+" : ""}{formatMontant(etat.resultat)}
            </Text>
            <Text style={[s.kpiSub, resultatPositif ? s.kpiSubNavy : {}]}>
              {resultatPositif ? "Excédent" : resultatNul ? "Équilibre" : "Déficit"}
            </Text>
          </View>
        </View>

        {/* ── Section Trésorerie ── */}
        {etat.tresorerie.length > 0 && (
          <View style={s.sectionBlock}>
            <Text style={s.sectionTitle}>Trésorerie</Text>
            <Text style={s.sectionSub}>Entrées et sorties de fonds par compte</Text>
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.th, s.cDate]}>Date</Text>
                <Text style={[s.th, s.cLib]}>Libellé</Text>
                <Text style={[s.th, s.cMt]}>Montant</Text>
              </View>

              {etat.tresorerie.map((section) => (
                <View key={section.compteId}>
                  <View style={s.tresGroupHeader}>
                    <Text style={s.tresGroupLabel}>{section.numero} — {section.nom}</Text>
                    <Text style={[s.tresGroupSolde, { color: section.solde >= 0 ? emerald : red }]}>
                      Solde : {formatMontant(section.solde)}
                    </Text>
                  </View>
                  {section.entrees.map((entree, i) => (
                    <View key={entree.id} style={[s.dataRow, i % 2 === 1 ? s.dataRowAlt : {}]}>
                      <Text style={[s.cell, s.cDate]}>{formatDate(entree.date)}</Text>
                      <Text style={[s.cell, s.cLib]}>{entree.libelle}</Text>
                      <Text style={[s.cell, s.cMt, { fontFamily: "Helvetica-Bold", color: emerald }]}>
                        +{formatMontant(entree.montant)}
                      </Text>
                    </View>
                  ))}
                  <View style={s.tresSummary}>
                    <Text style={s.tresSummaryText}>
                      Entrées : {formatMontant(section.totalEntrees)}
                    </Text>
                    <Text style={s.tresSummaryText}>
                      Sorties : -{formatMontant(section.totalSorties)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Solde Total Trésorerie</Text>
                <Text style={[s.totalVal, { color: soldePositif ? emerald : red }]}>
                  {formatMontant(etat.soldeTresorerie)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Section Charges ── */}
        {etat.charges.length > 0 && (
          <View style={s.sectionBlock}>
            <Text style={s.sectionTitle}>Charges</Text>
            <Text style={s.sectionSub}>Classe 6 — Charges engagées sur l'exercice</Text>
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.th, s.cNum]}>N° Compte</Text>
                <Text style={[s.th, s.cNom]}>Intitulé du compte</Text>
                <Text style={[s.th, s.cTotal]}>Montant</Text>
              </View>
              {etat.charges.flatMap((sec) =>
                sec.comptes.map((compte, i) => (
                  <View key={compte.compteId} style={[s.dataRow, i % 2 === 1 ? s.dataRowAlt : {}]}>
                    <Text style={[s.cellMono, s.cNum]}>{compte.numero}</Text>
                    <Text style={[s.cell, s.cNom]}>{compte.nom}</Text>
                    <Text style={[s.cell, s.cTotal, { fontFamily: "Helvetica-Bold", color: red }]}>
                      {formatMontant(compte.total)}
                    </Text>
                  </View>
                ))
              )}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total Charges</Text>
                <Text style={[s.totalVal, { color: red }]}>{formatMontant(etat.totalCharges)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Section Produits ── */}
        {etat.produits.length > 0 && (
          <View style={s.sectionBlock}>
            <Text style={s.sectionTitle}>Produits</Text>
            <Text style={s.sectionSub}>Classe 7 — Produits perçus sur l'exercice</Text>
            <View style={s.table}>
              <View style={s.thead}>
                <Text style={[s.th, s.cNum]}>N° Compte</Text>
                <Text style={[s.th, s.cNom]}>Intitulé du compte</Text>
                <Text style={[s.th, s.cTotal]}>Montant</Text>
              </View>
              {etat.produits.flatMap((sec) =>
                sec.comptes.map((compte, i) => (
                  <View key={compte.compteId} style={[s.dataRow, i % 2 === 1 ? s.dataRowAlt : {}]}>
                    <Text style={[s.cellMono, s.cNum]}>{compte.numero}</Text>
                    <Text style={[s.cell, s.cNom]}>{compte.nom}</Text>
                    <Text style={[s.cell, s.cTotal, { fontFamily: "Helvetica-Bold", color: emerald }]}>
                      {formatMontant(compte.total)}
                    </Text>
                  </View>
                ))
              )}
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total Produits</Text>
                <Text style={[s.totalVal, { color: emerald }]}>{formatMontant(etat.totalProduits)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <View style={s.footerContent}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={s.footerNote}>
                Document généré automatiquement le {exportDate} à {exportHour}.
              </Text>
              <Text style={[s.footerNote, { marginTop: 3 }]}>
                Ce document est produit à titre informatif à partir des données comptables enregistrées dans le système.
                Il ne se substitue pas aux documents officiels signés par le responsable financier.
              </Text>
            </View>
            <View style={s.signatureBox}>
              <Text style={s.signatureLabel}>Cachet et Signature</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
