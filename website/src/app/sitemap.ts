import { MetadataRoute } from 'next';
import { source } from '@/app/source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = 'https://akshaypatel.me/tyegit';

  // Automatically fetch all Fumadocs pages and generate sitemap entries
  const docs = source.getPages().map((page) => ({
    url: `${url}${page.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...docs,
  ];
}
