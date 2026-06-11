"use client";

import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Compte {
  id: number;
  numero: string;
  nom: string;
  classeId: number;
  parentId: number | null;
  enfants: Compte[];
  _count?: {
    depensesCharge: number;
    bonsCharge: number;
    ecritures: number;
    entreesProduitsCompte: number;
    entreesTresorerie: number;
  };
}

interface Classe {
  id: number;
  numero: string;
  nom: string;
  comptes: Compte[];
}

interface Props {
  classes: Classe[];
}

const CLASSE_COLORS: Record<string, string> = {
  "5": "border-blue-200 bg-blue-50",
  "6": "border-red-200 bg-red-50",
  "7": "border-emerald-200 bg-emerald-50",
};

const CLASSE_BADGE: Record<string, string> = {
  "5": "bg-blue-100 text-blue-700",
  "6": "bg-red-100 text-red-600",
  "7": "bg-emerald-100 text-emerald-700",
};

export default function PlanComptableView({ classes: initialClasses }: Props) {
  const [classes, setClasses] = useState(initialClasses);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState("");
  const [showAddForm, setShowAddForm] = useState<number | null>(null); // classeId
  const [addParentId, setAddParentId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState({ numero: "", nom: "" });
  const [saving, setSaving] = useState(false);

  const toggleExpand = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const reload = async () => {
    const res = await fetch("/api/plan-comptable");
    const data = await res.json();
    // rebuild flat → tree (only root comptes)
    setClasses(
      data.map((c: Classe) => ({
        ...c,
        comptes: c.comptes.filter((cc: Compte) => cc.parentId === null),
      }))
    );
  };

  const handleEdit = async (id: number) => {
    if (!editNom.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/plan-comptable/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: editNom }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Compte mis à jour");
      setEditingId(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/plan-comptable/${id}`, { method: "DELETE" });
      if (res.status === 409) {
        toast.error((await res.json()).error);
        return;
      }
      if (!res.ok) throw new Error("Erreur");
      toast.success("Compte supprimé");
      await reload();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (classeId: number) => {
    if (!addForm.numero || !addForm.nom) {
      toast.error("Numéro et nom requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/plan-comptable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, classeId, parentId: addParentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Compte ${addForm.numero} créé`);
      setShowAddForm(null);
      setAddForm({ numero: "", nom: "" });
      setAddParentId(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const usageCount = (c: Compte) =>
    (c._count?.depensesCharge ?? 0) +
    (c._count?.bonsCharge ?? 0) +
    (c._count?.ecritures ?? 0) +
    (c._count?.entreesProduitsCompte ?? 0) +
    (c._count?.entreesTresorerie ?? 0);

  const renderCompte = (compte: Compte, classeId: number, depth = 0) => {
    const hasChildren = compte.enfants?.length > 0;
    const key = `c-${compte.id}`;
    const isOpen = expanded[key];
    const isEditing = editingId === compte.id;
    const canDelete = usageCount(compte) === 0 && (!compte.enfants || compte.enfants.length === 0);

    return (
      <div key={compte.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/60 group ${depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-4" : ""}`}
        >
          {hasChildren ? (
            <button type="button" onClick={() => toggleExpand(key)} className="text-gray-400 cursor-pointer">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[14px]" />
          )}

          <span className="font-mono text-xs text-gray-400 w-14 shrink-0">{compte.numero}</span>

          {isEditing ? (
            <input
              type="text"
              value={editNom}
              onChange={(e) => setEditNom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit(compte.id)}
              className="flex-1 px-2 py-0.5 bg-white border border-blue-300 rounded text-sm focus:outline-none"
              aria-label="Nom du compte"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm text-gray-700">{compte.nom}</span>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <>
                <button type="button" onClick={() => handleEdit(compte.id)} disabled={saving}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer">
                  <Check size={13} />
                </button>
                <button type="button" onClick={() => setEditingId(null)}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer">
                  <X size={13} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(classeId);
                    setAddParentId(compte.id);
                    setAddForm({ numero: compte.numero.slice(0, 2), nom: "" });
                  }}
                  title="Ajouter un sous-compte"
                  className="p-1 text-blue-500 hover:bg-blue-50 rounded cursor-pointer"
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(compte.id); setEditNom(compte.nom); }}
                  title="Renommer"
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(compte.id)}
                    title="Supprimer"
                    className="p-1 text-red-400 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>

          {usageCount(compte) > 0 && (
            <span className="text-[10px] text-gray-300 font-mono">{usageCount(compte)} éc.</span>
          )}
        </div>

        {hasChildren && isOpen && (
          <div>
            {compte.enfants.map((e) => renderCompte(e, classeId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b] flex items-center gap-2">
          <BookOpen size={24} /> Plan comptable
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          SYSCOHADA simplifié — gestion des classes et comptes comptables
        </p>
      </div>

      {classes.map((classe) => (
        <div key={classe.id} className={`rounded-xl border shadow-sm overflow-hidden ${CLASSE_COLORS[classe.numero] ?? "border-gray-200 bg-gray-50"}`}>
          {/* Header classe */}
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${CLASSE_BADGE[classe.numero] ?? "bg-gray-100 text-gray-600"}`}>
                Classe {classe.numero}
              </span>
              <span className="font-bold text-[#11355b]">{classe.nom}</span>
              <span className="text-xs text-gray-400">{classe.comptes.length} compte{classe.comptes.length > 1 ? "s" : ""} racine</span>
            </div>
            <button
              type="button"
              onClick={() => { setShowAddForm(classe.id); setAddParentId(null); setAddForm({ numero: classe.numero, nom: "" }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <Plus size={13} /> Ajouter un compte
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm === classe.id && (
            <div className="mx-4 mb-3 p-3 bg-white border border-blue-200 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {addParentId ? "Nouveau sous-compte" : "Nouveau compte"}
              </p>
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Numéro</label>
                  <input
                    type="text"
                    value={addForm.numero}
                    onChange={(e) => setAddForm({ ...addForm, numero: e.target.value })}
                    placeholder="ex: 6210"
                    className="w-24 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-300"
                    aria-label="Numéro du compte"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-400 mb-1">Intitulé</label>
                  <input
                    type="text"
                    value={addForm.nom}
                    onChange={(e) => setAddForm({ ...addForm, nom: e.target.value })}
                    placeholder="ex: Fournitures pédagogiques"
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-300"
                    aria-label="Intitulé du compte"
                  />
                </div>
                <button type="button" onClick={() => handleAdd(classe.id)} disabled={saving}
                  className="px-3 py-1.5 bg-[#11355b] text-white rounded text-sm font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? "…" : "Ajouter"}
                </button>
                <button type="button" onClick={() => { setShowAddForm(null); setAddParentId(null); }}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-500 cursor-pointer">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des comptes */}
          <div className="bg-white/70 mx-4 mb-4 rounded-lg px-2 py-1">
            {classe.comptes.length === 0 ? (
              <p className="py-4 text-center text-xs text-gray-400">Aucun compte — ajoutez-en un.</p>
            ) : (
              classe.comptes.map((c) => renderCompte(c, classe.id))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
