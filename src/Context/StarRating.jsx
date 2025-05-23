// StarRating component for displaying and selecting ratings
const StarRating = ({ rating, onChange, starSize = 24 }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div>
            {stars.map((star) => {
                const isHalfStar = rating >= star - 0.5 && rating < star;
                const isFullStar = rating >= star;

                return (
                    <span
                        key={star}
                        style={{
                            cursor: 'pointer',
                            color: isFullStar ? 'gold' : 'gray',
                            fontSize: `${starSize}px`,
                        }}
                        onClick={() => onChange(isHalfStar ? star - 0.5 : star)}
                    >
                        {isHalfStar ? '☆' : '★'}
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;
