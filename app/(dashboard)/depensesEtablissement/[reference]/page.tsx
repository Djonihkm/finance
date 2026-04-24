"use client";

import { use } from 'react';
import { notFound } from 'next/navigation';
import DepenseDetail from '@/app/components/DepenseEtablissement';
import { depenses } from '@/app/data/depenses';

export default function DepenseDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const decoded = decodeURIComponent(reference);
  const item = depenses.find((d) => d.reference === decoded);

  if (!item) notFound();

  return <DepenseDetail data={item} />;
}
