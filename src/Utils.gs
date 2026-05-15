/**
 * Utils.gs
 * Library of utility functions for Discord formatting and data conversion.
 */
const Utils = (() => {
  /**
   * Converts a hex color string to a Discord-compatible decimal integer.
   *
   * @param {string} hex - The hex color string (e.g., "#FF0000" or "FF0000").
   * @returns {number} The decimal representation of the color.
   */
  function hexToDecimal(hex) {
    if (!hex) return 0;
    const cleanHex = hex.replace("#", "");
    return parseInt(cleanHex, 16);
  }

  /**
   * Generates a random decimal color for Discord embeds.
   * @returns {number}
   */
  function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
  }

  return Object.freeze({
    hexToDecimal,
    getRandomColor,
  });
})();
