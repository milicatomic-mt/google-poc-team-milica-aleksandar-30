export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const extractColorsFromImage = (imageUrl: string): Promise<ExtractedColors> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(getDefaultColors());
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractDominantColors(imageData.data);
      
      resolve(colors);
    };
    
    img.onerror = () => {
      resolve(getDefaultColors());
    };
    
    img.src = imageUrl;
  });
};

const extractDominantColors = (data: Uint8ClampedArray): ExtractedColors => {
  const colorCounts: { [key: string]: number } = {};
  const sampleSize = Math.floor(data.length / 1000); // Sample every 1000th pixel
  
  // Extract colors with sampling
  for (let i = 0; i < data.length; i += sampleSize * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 125) continue; // Skip transparent pixels
    
    // Quantize colors to reduce noise
    const quantizedR = Math.floor(r / 32) * 32;
    const quantizedG = Math.floor(g / 32) * 32;
    const quantizedB = Math.floor(b / 32) * 32;
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }
  
  // Sort colors by frequency
  const sortedColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return { r, g, b };
    });
  
  if (sortedColors.length === 0) {
    return getDefaultColors();
  }
  
  // Find primary color (most frequent non-grayscale)
  const primary = findColorfulColor(sortedColors) || sortedColors[0];
  
  // Generate complementary colors
  const secondary = generateComplementaryColor(primary);
  const accent = generateAnalogousColor(primary);
  
  // Determine if image is light or dark
  const avgBrightness = sortedColors.reduce((sum, color) => 
    sum + (color.r * 0.299 + color.g * 0.587 + color.b * 0.114), 0) / sortedColors.length;
  
  const isLight = avgBrightness > 128;
  
  return {
    primary: rgbToHsl(primary.r, primary.g, primary.b),
    secondary: rgbToHsl(secondary.r, secondary.g, secondary.b),
    accent: rgbToHsl(accent.r, accent.g, accent.b),
    background: isLight ? 'hsl(0, 0%, 98%)' : 'hsl(0, 0%, 8%)',
    text: isLight ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 95%)'
  };
};

const findColorfulColor = (colors: Array<{ r: number; g: number; b: number }>) => {
  return colors.find(color => {
    const max = Math.max(color.r, color.g, color.b);
    const min = Math.min(color.r, color.g, color.b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    return saturation > 0.2; // Only colorful colors
  });
};

const generateComplementaryColor = (color: { r: number; g: number; b: number }) => {
  return {
    r: Math.min(255, Math.max(0, 255 - color.r + Math.random() * 50 - 25)),
    g: Math.min(255, Math.max(0, 255 - color.g + Math.random() * 50 - 25)),
    b: Math.min(255, Math.max(0, 255 - color.b + Math.random() * 50 - 25))
  };
};

const generateAnalogousColor = (color: { r: number; g: number; b: number }) => {
  const shift = 30 + Math.random() * 40; // 30-70 degree shift
  return {
    r: Math.min(255, Math.max(0, color.r + shift)),
    g: Math.min(255, Math.max(0, color.g - shift / 2)),
    b: Math.min(255, Math.max(0, color.b + shift / 3))
  };
};

const rgbToHsl = (r: number, g: number, b: number): string => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

const getDefaultColors = (): ExtractedColors => ({
  primary: 'hsl(220, 70%, 50%)',
  secondary: 'hsl(280, 60%, 60%)',
  accent: 'hsl(340, 75%, 55%)',
  background: 'hsl(0, 0%, 98%)',
  text: 'hsl(0, 0%, 10%)'
});