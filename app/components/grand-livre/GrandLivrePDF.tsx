import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { type GrandLivre } from "@/lib/queries/grandLivre";
import { formatMontant, formatDate } from "@/lib/utils/formatters";

const navy = "#11355b";
const gray100 = "#f3f4f6";
const gray200 = "#e5e7eb";
const gray500 = "#6b7280";
const gray600 = "#4b5563";
const blue700 = "#1d4ed8";
const red600 = "#dc2626";
const white = "#ffffff";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
    paddingTop: 36,
    paddingBottom: 60,
    paddingHorizontal: 36,
  },

  /* ── En-tête ── */
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `2pt solid ${navy}`,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
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
    borderRadius: 4,
    border: `1pt solid ${gray200}`,
    overflow: "hidden",
  },
  kpiItem: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRight: `1pt solid ${gray200}`,
  },
  kpiItemLast: {
    borderRight: "none",
  },
  kpiLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: gray500,
    textTransform: "uppercase",
    marginBottom: 4,
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

  /* ── Tableau ── */
  tableTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: navy,
    marginBottom: 8,
  },
  table: {
    border: `1pt solid ${gray200}`,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 24,
  },
  thead: {
    flexDirection: "row",
    backgroundColor: navy,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: white,
    textTransform: "uppercase",
  },

  /* Ligne section / compte */
  sectionRow: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTop: `1pt solid ${gray200}`,
  },
  sectionText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: navy,
  },
  sectionSub: {
    fontSize: 9,
    color: gray500,
    marginLeft: 8,
  },

  /* Ligne de données */
  dataRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
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

  /* Ligne total compte */
  totalRow: {
    flexDirection: "row",
    backgroundColor: gray100,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTop: `1pt solid ${gray200}`,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: gray600,
    textTransform: "uppercase",
  },

  /* Ligne grand total */
  grandTotalRow: {
    flexDirection: "row",
    backgroundColor: navy,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  grandTotalText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: white,
    textTransform: "uppercase",
  },

  /* Colonnes */
  cNum:  { width: 60 },
  cNom:  { flex: 1 },
  cDate: { width: 62 },
  cLib:  { flex: 1 },
  cRef:  { width: 70 },
  cAmt:  { width: 80, textAlign: "right" },

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
    flex: 1,
  },
  signatureBox: {
    width: 160,
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

export function GrandLivrePDFDocument({
  grandLivre,
  annee,
}: {
  grandLivre: GrandLivre;
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

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.title}>Grand Livre</Text>
              <Text style={s.subtitle}>Journal détaillé des écritures comptables — Exercice {annee}</Text>
            </View>
            <View style={s.headerRight}>
              <Text style={s.headerRightLabel}>Exercice fiscal</Text>
              <Text style={s.headerRightValue}>{annee}</Text>
            </View>
          </View>
        </View>

        {/* KPIs */}
        <View style={s.kpiRow}>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Total Débit</Text>
            <Text style={[s.kpiValue, { color: blue700 }]}>{formatMontant(grandLivre.grandTotalDebit)}</Text>
          </View>
          <View style={s.kpiItem}>
            <Text style={s.kpiLabel}>Total Crédit</Text>
            <Text style={[s.kpiValue, { color: red600 }]}>{formatMontant(grandLivre.grandTotalCredit)}</Text>
          </View>
          <View style={[s.kpiItem, s.kpiItemLast]}>
            <Text style={s.kpiLabel}>Équilibre comptable</Text>
            <Text style={[s.kpiValue, { color: grandLivre.estEquilibre ? "#059669" : "#d97706" }]}>
              {grandLivre.estEquilibre ? "Équilibré" : "Déséquilibré"}
            </Text>
            <Text style={s.kpiSub}>Σ Débits = Σ Crédits</Text>
          </View>
        </View>

        {/* Tableau */}
        <Text style={s.tableTitle}>Détail des écritures par compte</Text>
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.cNum]}>N° Compte</Text>
            <Text style={[s.th, s.cNom]}>Intitulé</Text>
            <Text style={[s.th, s.cDate]}>Date</Text>
            <Text style={[s.th, s.cLib]}>Libellé</Text>
            <Text style={[s.th, s.cRef]}>Référence</Text>
            <Text style={[s.th, s.cAmt]}>Débit</Text>
            <Text style={[s.th, s.cAmt]}>Crédit</Text>
          </View>

          {grandLivre.sections.map((section) => (
            <View key={section.compteId}>
              {/* Groupe compte */}
              <View style={s.sectionRow}>
                <Text style={s.sectionText}>{section.numero} — {section.nom}</Text>
                <Text style={s.sectionSub}>({section.classeNom})</Text>
              </View>

              {/* Écritures */}
              {section.lignes.map((ligne, i) => (
                <View key={ligne.id} style={[s.dataRow, i % 2 === 1 ? s.dataRowAlt : {}]}>
                  <Text style={[s.cellMono, s.cNum]}>{section.numero}</Text>
                  <Text style={[s.cell, s.cNom]}>{section.nom}</Text>
                  <Text style={[s.cell, s.cDate]}>{formatDate(ligne.date)}</Text>
                  <Text style={[s.cell, s.cLib]}>{ligne.libelle ?? "—"}</Text>
                  <Text style={[s.cellMono, s.cRef]}>{ligne.reference ?? "—"}</Text>
                  <Text style={[s.cell, s.cAmt, { fontFamily: "Helvetica-Bold", color: blue700 }]}>
                    {ligne.debit > 0 ? formatMontant(ligne.debit) : "—"}
                  </Text>
                  <Text style={[s.cell, s.cAmt, { fontFamily: "Helvetica-Bold", color: red600 }]}>
                    {ligne.credit > 0 ? formatMontant(ligne.credit) : "—"}
                  </Text>
                </View>
              ))}

              {/* Total compte */}
              <View style={s.totalRow}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", paddingRight: 8 }}>
                  <Text style={s.totalLabel}>Sous-total — {section.numero}</Text>
                </View>
                <Text style={[s.cell, s.cAmt, { fontFamily: "Helvetica-Bold", color: blue700 }]}>
                  {section.totalDebit > 0 ? formatMontant(section.totalDebit) : "—"}
                </Text>
                <Text style={[s.cell, s.cAmt, { fontFamily: "Helvetica-Bold", color: red600 }]}>
                  {section.totalCredit > 0 ? formatMontant(section.totalCredit) : "—"}
                </Text>
              </View>
            </View>
          ))}

          {/* Grand total */}
          <View style={s.grandTotalRow}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", paddingRight: 8 }}>
              <Text style={s.grandTotalText}>Grand Total Général</Text>
            </View>
            <Text style={[s.cAmt, { fontFamily: "Helvetica-Bold", fontSize: 12, color: white }]}>
              {formatMontant(grandLivre.grandTotalDebit)}
            </Text>
            <Text style={[s.cAmt, { fontFamily: "Helvetica-Bold", fontSize: 12, color: white }]}>
              {formatMontant(grandLivre.grandTotalCredit)}
            </Text>
          </View>
        </View>

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
