// src/components/CoverImage.jsx
import getImageSrc from '../Context/imageHelper';
// if you put it in src/assets, import it:
// import placeholder from '../assets/no-cover.png';

const placeholder = '/no-cover.png';

export default function CoverImage({ cover, alt, className = '' }) {
  const src = cover
    ? getImageSrc(cover)
    : placeholder;

  return (
    <img
      src={src}
      alt={alt || 'No cover available'}
      className={`cover-image ${className}`}
      onError={e => {
        // if even your URL fails, fall back to placeholder
        if (e.currentTarget.src !== placeholder) {
          e.currentTarget.src = placeholder;
        }
      }}
    />
  );
}
