// src/utils/imageHelper.js

/**
 * Returns a valid <img> src for a given cover string,
 * but uses a larger IGDB size instead of the tiny thumb.
 *
 * IGDB size tokens include:
 *  • t_thumb        – 90×90
 *  • t_cover_small  – 90×128
 *  • t_cover_big    – 264×374
 *  • t_720p         – 720×960
 *  etc.
 */
export function getImageSrc(cover, size = 'cover_big') {
  if (!cover) {
    return '';
  }

  // If it’s an IGDB fragment (starts with “//images.igdb.com…”),
  // replace the “t_…” part with your chosen size token:
  if (cover.startsWith('//')) {
    // e.g. "//images.igdb.com/igdb/image/upload/t_thumb/co7k6g.jpg"
    return `https:${cover.replace(/t_[^/]+/, `t_${size}`)}`;
  }

  // Otherwise assume it’s base64 or a full URL already:
  if (/^[A-Za-z0-9+/=]+$/.test(cover)) {
    return `data:image/jpeg;base64,${cover}`;
  }

  return cover;
}

export default getImageSrc;
