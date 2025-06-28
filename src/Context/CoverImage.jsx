// src/Context/CoverImage.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Adjusted import path to match actual helper location
import getImageSrc from '../Context/imageHelper';

// Fallback image served from public/assets
const placeholder = '/assets/default-avatar.jpg';

export default function CoverImage({ cover, alt, className = '' }) {
  const [src, setSrc] = useState(() => {
    if (!cover) return placeholder;
    const normalized = getImageSrc(cover);
    return normalized || placeholder;
  });

  useEffect(() => {
    if (!cover) {
      setSrc(placeholder);
    } else {
      const normalized = getImageSrc(cover);
      setSrc(normalized || placeholder);
    }
  }, [cover]);

  return (
    <img
      src={src}
      alt={alt || 'No image'}
      className={`cover-image ${className}`}
      onError={() => {
        if (src !== placeholder) setSrc(placeholder);
      }}
    />
  );
}

CoverImage.propTypes = {
  cover: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};
