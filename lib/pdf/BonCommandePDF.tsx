import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";
import type { BonRow } from "@/lib/queries";
import { formatMontant, formatDate, formatStatut } from "@/lib/utils/formatters";

const C = {
  navy:      "#11355b",
  navyLight: "#1a4a7a",
  gray50:    "#f9fafb",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray700:   "#374151",
  emerald:   "#059669",
  red:       "#dc2626",
  amber:     "#d97706",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.gray700, padding: "32 40 50 40", backgroundColor: "#ffffff" },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: C.navy },
  headerLeft:  { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 2 },
  headerSub:   { fontSize: 8, color: C.gray400, letterSpacing: 1, textTransform: "uppercase" },
  headerRight: { alignItems: "flex-end" },
  refBox:      { backgroundColor: C.navy, padding: "6 12", borderRadius: 4 },
  refText:     { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 11 },
  refDate:     { fontSize: 8, color: C.gray400, marginTop: 4 },

  badgeRow: { flexDirection: "row", marginBottom: 16 },
  badge:    { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100, fontSize: 8, fontFamily: "Helvetica-Bold" },

  infoRow:  { flexDirection: "row", gap: 12, marginBottom: 16 },
  infoBox:  { flex: 1, backgroundColor: C.gray50, borderRadius: 4, padding: "8 10" },
  infoLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  infoVal:  { fontSize: 9, color: C.navy, fontFamily: "Helvetica-Bold" },
  infoValN: { fontSize: 9, color: C.gray700 },

  sectionTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.gray100 },

  // Table
  table:         { marginBottom: 12, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, overflow: "hidden" },
  tableHead:     { flexDirection: "row", backgroundColor: C.navy, padding: "6 8" },
  tableHeadCell: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow:      { flexDirection: "row", padding: "5 8", borderTopWidth: 1, borderTopColor: C.gray100 },
  tableRowAlt:   { backgroundColor: C.gray50 },
  tableCell:     { fontSize: 9, color: C.gray700 },
  tableCellBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy },

  colDesig:  { flex: 4 },
  colQty:    { flex: 1, textAlign: "center" },
  colPrix:   { flex: 2, textAlign: "right" },
  colTotal:  { flex: 2, textAlign: "right" },

  // Total box
  totalRow:   { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16 },
  totalBox:   { backgroundColor: C.navy, padding: "8 16", borderRadius: 4, flexDirection: "row", gap: 24, alignItems: "center" },
  totalLabel: { fontSize: 8, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 },
  totalVal:   { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#ffffff" },

  // Description / commentaire
  textBox:     { backgroundColor: C.gray50, borderRadius: 4, padding: "8 10", marginBottom: 8 },
  textBoxLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  textBoxVal:  { fontSize: 9, color: C.gray700, lineHeight: 1.5 },
  commentBox:  { backgroundColor: "#fffbeb", borderLeftWidth: 3, borderLeftColor: C.amber, padding: "8 10", marginBottom: 8, borderRadius: 2 },
  commentLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.amber, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  commentVal:  { fontSize: 9, color: "#92400e" },

  // Signatures
  sigRow:  { flexDirection: "row", gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.gray100 },
  sigBox:  { flex: 1, borderWidth: 1, borderColor: C.gray100, borderRadius: 4, padding: "8 10" },
  sigLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  sigName: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy },
  sigDate: { fontSize: 8, color: C.gray400, marginTop: 2 },
  sigEmpty:{ fontSize: 8, color: C.gray400, fontStyle: "italic" },

  footer:    { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.gray100, paddingTop: 8 },
  footerText:{ fontSize: 7, color: C.gray400 },
});

const STATUT_PDF: Record<string, { bg: string; color: string; label: string }> = {
  ATTENTE:  { bg: "#f3f4f6", color: "#4b5563", label: "En attente" },
  REVIEW:   { bg: "#dbeafe", color: "#1d4ed8", label: "En cours de revue" },
  REVISION: { bg: "#fef3c7", color: "#92400e", label: "En révision" },
  VALIDE:   { bg: "#d1fae5", color: "#065f46", label: "Validé" },
  REJETE:   { bg: "#fee2e2", color: "#991b1b", label: "Rejeté" },
};

export function BonCommandePDF({ data }: { data: BonRow }) {
  const statut = STATUT_PDF[data.statut] ?? { bg: C.gray100, color: C.gray700, label: data.statut };
  const montantTotal = parseFloat(data.montantTotal.toString());

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>BON DE COMMANDE</Text>
            <Text style={s.headerSub}>Document officiel — Système de gestion financière</Text>
          </View>
          <View style={s.headerRight}>
            <View style={s.refBox}>
              <Text style={s.refText}>{data.reference}</Text>
            </View>
            <Text style={s.refDate}>{formatDate(data.date)}</Text>
          </View>
        </View>

        {/* Badge statut */}
        <View style={s.badgeRow}>
          <View style={[s.badge, { backgroundColor: statut.bg }]}>
            <Text style={{ color: statut.color }}>{statut.label.toUpperCase()}</Text>
          </View>
        </View>

        {/* Infos générales */}
        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Intitulé</Text>
            <Text style={s.infoVal}>{data.intitule}</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Fournisseur</Text>
            <Text style={s.infoValN}>{data.fournisseur ?? "Non renseigné"}</Text>
          </View>
        </View>
        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Établissement</Text>
            <Text style={s.infoValN}>{data.etablissement.nom}</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>Créé par</Text>
            <Text style={s.infoValN}>{data.createdBy.prenom} {data.createdBy.nom}</Text>
          </View>
        </View>

        {/* Description */}
        {data.description && (
          <View style={s.textBox}>
            <Text style={s.textBoxLabel}>Description</Text>
            <Text style={s.textBoxVal}>{data.description}</Text>
          </View>
        )}

        {/* Tableau des lignes */}
        <Text style={s.sectionTitle}>Détail de la commande</Text>
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, s.colDesig]}>Désignation</Text>
            <Text style={[s.tableHeadCell, s.colQty]}>Qté</Text>
            <Text style={[s.tableHeadCell, s.colPrix]}>Prix unitaire</Text>
            <Text style={[s.tableHeadCell, s.colTotal]}>Total</Text>
          </View>
          {data.lignes.length === 0 ? (
            <View style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 1, textAlign: "center", color: C.gray400 }]}>Aucune ligne</Text>
            </View>
          ) : (
            data.lignes.map((l, i) => (
              <View key={l.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                <Text style={[s.tableCell, s.colDesig]}>{l.designation}</Text>
                <Text style={[s.tableCell, s.colQty]}>{l.quantite}</Text>
                <Text style={[s.tableCell, s.colPrix]}>{formatMontant(parseFloat(l.prixUnitaire.toString()))}</Text>
                <Text style={[s.tableCellBold, s.colTotal]}>{formatMontant(parseFloat(l.montant.toString()))}</Text>
              </View>
            ))
          )}
        </View>

        {/* Total */}
        <View style={s.totalRow}>
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>Total TTC</Text>
            <Text style={s.totalVal}>{formatMontant(montantTotal)}</Text>
          </View>
        </View>

        {/* Commentaire */}
        {data.commentaire && (
          <View style={s.commentBox}>
            <Text style={s.commentLabel}>Commentaire</Text>
            <Text style={s.commentVal}>{data.commentaire}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Créé par</Text>
            <Text style={s.sigName}>{data.createdBy.prenom} {data.createdBy.nom}</Text>
            <Text style={s.sigDate}>{formatDate(data.date)}</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Signé par</Text>
            {data.signePar ? (
              <>
                <Text style={s.sigName}>{data.signePar.prenom} {data.signePar.nom}</Text>
                {data.signeAt && <Text style={s.sigDate}>{formatDate(data.signeAt)}</Text>}
              </>
            ) : (
              <Text style={s.sigEmpty}>En attente</Text>
            )}
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Validé par</Text>
            {data.validePar ? (
              <>
                <Text style={s.sigName}>{data.validePar.prenom} {data.validePar.nom}</Text>
                {data.valideAt && <Text style={s.sigDate}>{formatDate(data.valideAt)}</Text>}
              </>
            ) : (
              <Text style={s.sigEmpty}>En attente</Text>
            )}
          </View>
        </View>

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Ministère — Système de gestion financière</Text>
          <Text style={s.footerText}>{data.reference} · Généré le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}
