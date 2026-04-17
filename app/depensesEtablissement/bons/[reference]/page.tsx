"use client";

import { use } from 'react';
import { notFound } from 'next/navigation';
import BonCommandeDetail from '../../../components/BonsEtablissement';
import { bonsCommandes } from '../../../data/depenses';

export default function BonCommandeDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const decoded = decodeURIComponent(reference);
  const item = bonsCommandes.find((b) => b.reference === decoded);

  if (!item) notFound();

  return <BonCommandeDetail data={item} />;
}
