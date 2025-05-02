export const opacityToHex = (opacity: number) => {
  opacity = Math.min(1, Math.max(0, opacity));

  var hexValue = Math.round(opacity * 255).toString(16);

  if (hexValue.length === 1) {
    hexValue = '0' + hexValue;
  }

  return hexValue.toUpperCase();
};
