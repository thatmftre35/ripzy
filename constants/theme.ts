import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#888888',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E5E5E5',
    tint: '#000000',
    icon: '#888888',
    tabIconDefault: '#888888',
    tabIconSelected: '#000000',
    destructive: '#FF3B30',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#666666',
    background: '#000000',
    surface: '#111111',
    border: '#222222',
    tint: '#FFFFFF',
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: '#FFFFFF',
    destructive: '#FF453A',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
