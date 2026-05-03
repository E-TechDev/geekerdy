export const detectMediaType = (url?: string) => {
  if (!url) return 'image';
  const normalized = url.trim().toLowerCase();
  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube';
  if (normalized.includes('instagram.com') || normalized.includes('instagr.am')) return 'instagram';
  if (normalized.includes('facebook.com') || normalized.includes('fb.watch') || normalized.includes('fb.com')) return 'facebook';
  if (normalized.includes('tiktok.com')) return 'tiktok';
  if (normalized.includes('vimeo.com')) return 'vimeo';
  return 'image';
};

const getYoutubeVideoId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:.*v=|.*embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match?.[1];
};

const getInstagramPostId = (url: string) => {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/);
  return match?.[1];
};

const getTiktokVideoId = (url: string) => {
  const match = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  return match?.[1];
};

const getFacebookVideoUrl = (url: string) => {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=640`;
};

export const getEmbedUrl = (url: string, type: string) => {
  if (type === 'youtube') {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (type === 'instagram') {
    const postId = getInstagramPostId(url);
    return postId ? `https://www.instagram.com/p/${postId}/embed/` : url;
  }

  if (type === 'tiktok') {
    const videoId = getTiktokVideoId(url);
    return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
  }

  if (type === 'facebook') {
    return getFacebookVideoUrl(url);
  }

  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    const videoId = match?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }

  return url;
};

export const isBlobOrDataUrl = (url?: string) => {
  return !!url && (url.startsWith('blob:') || url.startsWith('data:'));
};

export const isImageUrl = (url?: string) => {
  if (!url) return false;
  return isBlobOrDataUrl(url) || /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url);
};