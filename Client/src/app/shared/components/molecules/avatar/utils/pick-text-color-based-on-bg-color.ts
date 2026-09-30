import pSBC from './psbc';

/**
 * Calculates the appropriate text color based on the background color.
 */
const pickTextColorBasedOnBgColor = (bgColor: string) => {
  if (bgColor) {
    let color = String(bgColor)
      .toUpperCase()
      .replace(/[^0-9a-f]/gi, '');
    if (color.length < 6) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const uiColors = [r / 255, g / 255, b / 255];
    const c = uiColors.map(col => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return pSBC(L > 0.4 ? -0.7 : 0.7, bgColor);
  }
  return '';
};

export default pickTextColorBasedOnBgColor;
