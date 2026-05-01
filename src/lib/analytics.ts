// Simple analytics tracking
interface ClickData {
  spotifyClicks: number;
  youtubeClicks: number;
  boomplayClicks: number;
  socialClicks: { [key: string]: number };
}

let clickData: ClickData = {
  spotifyClicks: 0,
  youtubeClicks: 0,
  boomplayClicks: 0,
  socialClicks: {
    youtube: 0,
    instagram: 0,
    tiktok: 0,
    twitter: 0,
    facebook: 0,
  },
};

export const trackClick = (type: string, platform?: string) => {
  if (type === 'spotify') {
    clickData.spotifyClicks++;
  } else if (type === 'youtube') {
    clickData.youtubeClicks++;
  } else if (type === 'boomplay') {
    clickData.boomplayClicks++;
  } else if (type === 'social' && platform) {
    clickData.socialClicks[platform] = (clickData.socialClicks[platform] || 0) + 1;
  }
  // In a real app, send to server
  console.log('Click tracked:', type, platform);
};

export const getClickData = (): ClickData => {
  return { ...clickData };
};

export const resetClickData = () => {
  clickData = {
    spotifyClicks: 0,
    youtubeClicks: 0,
    boomplayClicks: 0,
    socialClicks: {
      youtube: 0,
      instagram: 0,
      tiktok: 0,
      twitter: 0,
      facebook: 0,
    },
  };
};