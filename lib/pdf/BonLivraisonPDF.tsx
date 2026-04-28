import {
  Document, Page, Text, View, StyleSheet, Image,
} from "@react-pdf/renderer";
import type { BonRow } from "@/lib/queries";
import { formatDate } from "@/lib/utils/formatters";

const C = {
  navy:    "#11355b",
  gray50:  "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray700: "#374151",
  orange:  "#d97706",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: C.gray700, padding: "28 36 36 36", backgroundColor: "#ffffff" },

  // ── En-tête ──────────────────────────────────────────────────────────────────
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: C.navy },
  logoBox: { width: 52, height: 52, marginRight: 16 },
  titleBlock: { flex: 1, alignItems: "center" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.navy, letterSpacing: 1 },
  titleSub: { fontSize: 7, color: C.gray400, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 3 },
  addrBlock: { alignItems: "flex-end" },
  addrLine: { fontSize: 7.5, color: C.gray700, lineHeight: 1.6 },

  // ── Info grid ─────────────────────────────────────────────────────────────────
  infoRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  infoLeft: { flex: 4, gap: 8 },
  infoRight: { flex: 6, backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: "8 12" },

  infoEntry: { borderLeftWidth: 3, borderLeftColor: C.navy, paddingLeft: 8, marginBottom: 4 },
  infoLabel: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  infoVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.navy },
  infoValSm: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.navy },

  fournLabel: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  fournNom: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 3 },
  fournSub: { fontSize: 8, color: C.gray700 },

  // ── Table ─────────────────────────────────────────────────────────────────────
  table: { borderWidth: 1, borderColor: C.gray200, borderRadius: 3, overflow: "hidden", marginBottom: 16 },
  thead: { flexDirection: "row", backgroundColor: C.navy, paddingVertical: 6, paddingHorizontal: 8 },
  theadCell: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  trow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.gray100 },
  trowAlt: { backgroundColor: C.gray50 },
  temptyRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.gray100 },
  tcell: { fontSize: 8.5, color: C.gray700 },
  tcellBold: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.navy },
  tcellOrange: { fontSize: 8, color: C.orange },

  cDesig: { flex: 5 },
  cQteCmd: { flex: 2, textAlign: "center" },
  cQteLiv: { flex: 2, textAlign: "center" },
  cObs: { flex: 3 },

  // ── Bas de page ───────────────────────────────────────────────────────────────
  bottomRow: { flexDirection: "row", gap: 16, marginTop: 4 },

  sigSection: { flex: 5 },
  sigBoxRow: { flexDirection: "row", gap: 10 },
  sigBox: { flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 3, padding: "6 8", height: 64 },
  sigLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 0.8 },

  totalsSection: { flex: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.gray100, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 2, borderRadius: 2 },
  totalLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.gray700, textTransform: "uppercase", letterSpacing: 0.5 },
  totalVal: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.navy },

  faitA: { marginTop: 10, fontSize: 7.5, color: C.gray700 },

  footer: { position: "absolute", bottom: 18, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.gray100, paddingTop: 6 },
  footerText: { fontSize: 6.5, color: C.gray400 },
});

const EMPTY_ROWS = 4;

export function BonLivraisonPDF({ data, logoUrl }: { data: BonRow; logoUrl?: string }) {
  const totalArticles = data.lignes.length;
  const totalQteLivree = data.lignes.reduce((sum, l) => sum + l.quantite, 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* En-tête */}
        <View style={s.header}>
          <View style={s.logoBox}>
            {logoUrl && <Image src={logoUrl} style={{ width: 52, height: 52, objectFit: "contain" }} />}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.title}>BON DE LIVRAISON</Text>
            <Text style={s.titleSub}>Document de procurement autorisé</Text>
          </View>
          <View style={s.addrBlock}>
            <Text style={s.addrLine}>Cité Ministérielle</Text>
            <Text style={s.addrLine}>Quartier Cadjèhoun – Ahouanléko</Text>
            <Text style={s.addrLine}>12ᵉ arrondissement, Commune de Cotonou</Text>
            <Text style={s.addrLine}>République du Bénin</Text>
          </View>
        </View>

        {/* Infos commande + fournisseur */}
        <View style={s.infoRow}>
          <View style={s.infoLeft}>
            <View style={s.infoEntry}>
              <Text style={s.infoLabel}>N° de commande</Text>
              <Text style={s.infoVal}>{data.reference}</Text>
            </View>
            <View style={s.infoEntry}>
              <Text style={s.infoLabel}>Date d'émission</Text>
              <Text style={s.infoValSm}>{formatDate(data.date)}</Text>
            </View>
            <View style={s.infoEntry}>
              <Text style={s.infoLabel}>Date de livraison</Text>
              <Text style={s.infoValSm}>………………………………</Text>
            </View>
          </View>
          <View style={s.infoRight}>
            <Text style={s.fournLabel}>Coordonnées du fournisseur</Text>
            <Text style={s.fournNom}>{data.fournisseur ?? "Non renseigné"}</Text>
            <Text style={s.fournSub}>{data.etablissement.nom}</Text>
          </View>
        </View>

        {/* Tableau des lignes */}
        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.theadCell, s.cDesig]}>Désignation</Text>
            <Text style={[s.theadCell, s.cQteCmd]}>Qté commandée</Text>
            <Text style={[s.theadCell, s.cQteLiv]}>Qté livrée</Text>
            <Text style={[s.theadCell, s.cObs]}>Observation</Text>
          </View>

          {data.lignes.map((l, i) => (
            <View key={l.id} style={[s.trow, i % 2 === 1 ? s.trowAlt : {}]}>
              <Text style={[s.tcell, s.cDesig]}>{l.designation}</Text>
              <Text style={[s.tcell, s.cQteCmd]}>{l.quantite}</Text>
              <Text style={[s.tcell, s.cQteLiv]}>{l.quantite}</Text>
              <Text style={[s.tcell, s.cObs]}>—</Text>
            </View>
          ))}

          {Array.from({ length: EMPTY_ROWS }).map((_, i) => (
            <View key={`empty-${i}`} style={s.temptyRow}>
              <Text style={[s.tcell, s.cDesig]}> </Text>
              <Text style={[s.tcell, s.cQteCmd]}> </Text>
              <Text style={[s.tcell, s.cQteLiv]}> </Text>
              <Text style={[s.tcell, s.cObs]}> </Text>
            </View>
          ))}
        </View>

        {/* Signatures + totaux */}
        <View style={s.bottomRow}>
          <View style={s.sigSection}>
            <View style={s.sigBoxRow}>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Signature du livreur</Text>
              </View>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Signature du client</Text>
              </View>
            </View>
            <Text style={s.faitA}>
              {"Fait à : ……………………………………………, Date : ……… / ……… / 20 ………"}
            </Text>
          </View>

          <View style={s.totalsSection}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total articles :</Text>
              <Text style={s.totalVal}>{String(totalArticles).padStart(2, "0")}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total quantités livrées :</Text>
              <Text style={s.totalVal}>{totalQteLivree}</Text>
            </View>
          </View>
        </View>

        {/* Pied de page */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Ministère — Système de gestion financière</Text>
          <Text style={s.footerText}>Réf. {data.reference} · Généré le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
}
