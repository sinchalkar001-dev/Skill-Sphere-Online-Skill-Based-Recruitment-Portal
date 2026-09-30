import { getInitials } from '../../utils/helpers';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
  '2xl': 'h-20 w-20 text-2xl',
};

// Initials badge for people (round) and companies (square). Decorative: the name is always shown nearby.
const Avatar = ({ name, size = 'md', square = false, className = '' }) => (
  <span
    aria-hidden="true"
    className={`inline-flex flex-shrink-0 select-none items-center justify-center bg-primary-soft font-bold text-primary-soft-foreground ${
      square ? 'rounded-lg' : 'rounded-full'
    } ${sizes[size]} ${className}`}
  >
    {getInitials(name)}
  </span>
);

export default Avatar;
