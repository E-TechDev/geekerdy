import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://geekerdy.com', lastModified: new Date() },
    { url: 'https://geekerdy.com/music', lastModified: new Date() },
    { url: 'https://geekerdy.com/videos', lastModified: new Date() },
    { url: 'https://geekerdy.com/about', lastModified: new Date() },
    { url: 'https://geekerdy.com/gallery', lastModified: new Date() },
    { url: 'https://geekerdy.com/events', lastModified: new Date() },
    { url: 'https://geekerdy.com/contact', lastModified: new Date() },
    { url: 'https://geekerdy.com/admin', lastModified: new Date() },
  ];
}
