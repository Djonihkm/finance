"use client";

import { use } from 'react';
import { notFound } from 'next/navigation';
import BonCommandeDetail from '@/app/components/BonsEtablissement';
import { bonsCommandes } from '@/app/data/depenses';

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
