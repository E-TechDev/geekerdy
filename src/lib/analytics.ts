// Simple analytics tracking
interface ClickData {
  spotifyClicks: number;
  youtubeClicks: number;
  boomplayClicks: number;
  socialClicks: { [key: string]: number };
}

const STORAGE_KEY = 'geekerdy_click_analytics';

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

export const loadClickData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      clickData = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

export const persistClickData = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clickData));
  } catch (error) {
    console.error('Failed to persist analytics:', error);
  }
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
  persistClickData();
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
  persistClickData();
};