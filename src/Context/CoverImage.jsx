// src/components/CoverImage.jsx
import PropTypes from 'prop-types';
import getImageSrc from '../Context/imageHelper';
const placeholder = '/no-cover.png';

export default function CoverImage({
  cover = null,
  alt   = '',
}) {
  const src = cover ? getImageSrc(cover) : placeholder;

  return (
    <img
      src={src}
      alt={alt || 'No cover available'}
      className="cover-image"
      onError={e => {
        if (e.currentTarget.src !== placeholder) {
          e.currentTarget.src = placeholder;
        }
      }}
    />
  );
}

CoverImage.propTypes = {
  cover: PropTypes.string,
  alt:   PropTypes.string,
};
