
export interface BackgroundSetting {
  pageId: string;
  type: 'color' | 'image' | 'stars';
  value: string;
  opacity?: number;
}

export interface PageBackgroundSettings {
  [key: string]: BackgroundSetting;
}
