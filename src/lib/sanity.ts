import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tm9ha2vu';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

export const getSanityImageUrl = (image: { asset?: { _ref?: string } } | string | undefined): string | undefined => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  const ref = image.asset?._ref;
  if (!ref || typeof ref !== 'string' || !ref.startsWith('image-')) return undefined;

  const parts = ref.split('-');
  if (parts.length < 4) return undefined;

  const assetId = parts[1];
  const dimension = parts[2];
  const extension = parts[3];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimension}.${extension}`;
};
