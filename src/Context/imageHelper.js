// src/utils/imageHelper.js
// Utility to normalize cover image sources (base64 or IGDB URL fragment)

/**
 * Returns a valid <img> src for a given cover string.
 * - If it starts with '//' assumes IGDB URL fragment and prefixes https:
 * - If it looks like base64 (no leading //), prefixes a data URI header
 * - Otherwise returns the original string
 *
 * @param {string} cover - The raw cover value from the API
 * @returns {string} A normalized image src
 */
export function getImageSrc(cover) {
  if (!cover) {
    // No cover provided
    return '';
  }

  // IGDB URL fragment: //images.igdb.com/...
  if (cover.startsWith('//')) {
    return `https:${cover}`;
  }

  // Base64 blob (assumes raw base64 string without data URI prefix)
  // You may adjust this check if you store other formats
  return `data:image/jpeg;base64,${cover}`;
}

export default getImageSrc;
