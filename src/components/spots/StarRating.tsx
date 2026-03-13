interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}

export default function StarRating({ value, onChange, size = 'md' }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-lg';
  const interactive = !!onChange;

  return (
    <div className={`flex gap-0.5 ${interactive ? 'cursor-pointer' : ''}`}>
      {stars.map(star => (
        <span
          key={star}
          onClick={() => onChange?.(value === star ? 0 : star)}
          className={`${sizeClass} select-none ${
            star <= value
              ? 'text-yellow-400'
              : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-300 transition-colors' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
