/**
 * Sérialise les données Prisma (Decimal, Date…) en objets plain JSON
 * avant de les passer à un Client Component.
 *
 * - Decimal → string  (Decimal.toJSON() retourne sa représentation textuelle)
 * - Date    → string  (ISO 8601)
 * - Le reste passe tel quel
 *
 * Les fonctions formatDate / formatMontant acceptent déjà string en entrée.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
