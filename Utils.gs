/**
 * Converts a hex color string to a Discord-compatible decimal integer.
 *
 * @param {string} hex - The hex color string (e.g., "#FF0000" or "FF0000").
 * @returns {number} The decimal representation of the color.
 */
function Utils_hexToDecimal(hex) {
  if (!hex) return 0;
  const cleanHex = hex.replace("#", "");
  return parseInt(cleanHex, 16);
}
