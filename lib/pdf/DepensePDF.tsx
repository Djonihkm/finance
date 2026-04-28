import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";
import type { DepenseRow } from "@/lib/queries";
import {
  formatMontant, formatDate, formatCategorie,
  formatPaiement, formatStatut,
} from "@/lib/utils/formatters";

const C = {
  navy:    "#11355b",
  navyLight: "#1a4a7a",
  gray50:  "#f9fafb",
  gray100: "#f3f4f6",
  gray400: "#9ca3af",
  gray700: "#374151",
  emerald: "#059669",
  red:     "#dc2626",
  amber:   "#d97706",
  blue:    "#2563eb",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.gray700, padding: "32 40 40 40", backgroundColor: "#ffffff" },

  // En-tête
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: C.navy },
  headerLeft:   { flex: 1 },
  headerTitle:  { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 2 },
  headerSub:    { fontSize: 8, color: C.gray400, letterSpacing: 1, textTransform: "uppercase" },
  headerRight:  { alignItems: "flex-end" },
  refBox:       { backgroundColor: C.navy, padding: "6 12", borderRadius: 4 },
  refText:      { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 11 },
  refDate:      { fontSize: 8, color: C.gray400, marginTop: 4 },

  // Badge statut
  badgeRow:   { flexDirection: "row", marginBottom: 20 },
  badge:      { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Sections
  section:     { marginBottom: 16 },
  sectionTitle:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.gray100 },

  // Grid de champs
  row2:      { flexDirection: "row", gap: 12, marginBottom: 10 },
  field:     { flex: 1 },
  label:     { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  value:     { fontSize: 9, color: C.navy, fontFamily: "Helvetica-Bold" },
  valueNorm: { fontSize: 9, color: C.gray700 },

  // Montant mise en avant
  montantBox:  { backgroundColor: C.navy, padding: "10 16", borderRadius: 6, marginBottom: 16 },
  montantLabel:{ fontSize: 7, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  montantVal:  { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#ffffff" },

  // Bloc texte (description/commentaire)
  textBox:     { backgroundColor: C.gray50, borderRadius: 4, padding: "8 10", marginBottom: 8 },
  textBoxLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  textBoxVal:  { fontSize: 9, color: C.gray700, lineHeight: 1.5 },

  // Commentaire (orange)
  commentBox:  { backgroundColor: "#fffbeb", borderLeftWidth: 3, borderLeftColor: C.amber, padding: "8 10", marginBottom: 8, borderRadius: 2 },
  commentLabel:{ fontSize: 7, fontFamily: "Helvetica-Bold", color: C.amber, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  commentVal:  { fontSize: 9, color: "#92400e" },

  // Signatures
  sigRow:    { flexDirection: "row", gap: 12, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.gray100 },
  sigBox:    { flex: 1, borderWidth: 1, borderColor: C.gray100, borderRadius: 4, padding: "8 10" },
  sigLabel:  { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  sigName:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy },
  sigDate:   { fontSize: 8, color: C.gray400, marginTop: 2 },
  sigEmpty:  { fontSize: 8, color: C.gray400, fontStyle: "italic" },

  // Pied
  footer:     { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.gray100, paddingTop: 8 },
  footerText: { fontSize: 7, color: C.gray400 },
});

const STATUT_PDF: Record<string, { bg: string; color: string; label: string }> = {
  ATTENTE:  { bg: "#f3f4f6", color: "#4b5563", label: "En attente" },
  REVIEW:   { bg: "#dbeafe", color: "#1d4ed8", label: "En cours de revue" },
  REVISION: { bg: "#fef3c7", color: "#92400e", label: "En révision" },
  VALIDE:   { bg: "#d1fae5", color: "#065f46", label: "Validé" },
  REJETE:   { bg: "#fee2e2", color: "#991b1b", label: "Rejeté" },
};

export function DepensePDF({ data }: { data: DepenseRow }) {
  const statut = STATUT_PDF[data.statut] ?? { bg: C.gray100, color: C.gray700, label: data.statut };
  const montant = parseFloat(data.montant.toString());

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>FICHE DE DÉPENSE</Text>
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

        {/* Montant */}
        <View style={s.montantBox}>
          <Text style={s.montantLabel}>Montant total</Text>
          <Text style={s.montantVal}>{formatMontant(montant)}</Text>
        </View>

        {/* Informations principales */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Informations générales</Text>
          <View style={s.row2}>
            <View style={s.field}>
              <Text style={s.label}>Intitulé</Text>
              <Text style={s.value}>{data.intitule}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.label}>Catégorie</Text>
              <Text style={s.valueNorm}>{formatCategorie(data.categorie)}</Text>
            </View>
          </View>
          <View style={s.row2}>
            <View style={s.field}>
              <Text style={s.label}>Mode de paiement</Text>
              <Text style={s.valueNorm}>{formatPaiement(data.paiement)}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.label}>Établissement</Text>
              <Text style={s.valueNorm}>{data.etablissement.nom}</Text>
            </View>
          </View>
          <View style={s.row2}>
            <View style={s.field}>
              <Text style={s.label}>Créé par</Text>
              <Text style={s.valueNorm}>{data.createdBy.prenom} {data.createdBy.nom}</Text>
            </View>
            {data.fournisseur && (
              <View style={s.field}>
                <Text style={s.label}>Fournisseur</Text>
                <Text style={s.valueNorm}>{data.fournisseur}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {data.description && (
          <View style={s.textBox}>
            <Text style={s.textBoxLabel}>Description</Text>
            <Text style={s.textBoxVal}>{data.description}</Text>
          </View>
        )}

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
