import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-xl',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

const statusPositionClasses: Record<AvatarSize, Record<string, string>> = {
  xs: {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
  sm: {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
  md: {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
  lg: {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
  xl: {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
  '2xl': {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  },
};

const statusColors = {
  online: 'bg-[var(--success)] border-[var(--bg-base)]',
  offline: 'bg-[var(--text-tertiary)] border-[var(--bg-base)]',
  busy: 'bg-[var(--error)] border-[var(--bg-base)]',
  away: 'bg-[var(--warning)] border-[var(--bg-base)]',
};

const generateInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-500 to-pink-600',
    'bg-gradient-to-br from-orange-500 to-orange-600',
    'bg-gradient-to-br from-teal-500 to-teal-600',
    'bg-gradient-to-br from-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-rose-500 to-rose-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
  ...props
}) => {
  const hasImage = Boolean(src);
  const initials = fallback || (alt ? generateInitials(alt) : '?');
  const bgColor = alt ? getColorFromName(alt) : 'bg-gradient-to-br from-[var(--text-tertiary)] to-[var(--text-tertiary)]';

  const statusElement = status && (
    <span
      className={`
        absolute rounded-full border-2
        ${statusColors[status]}
        ${statusSizeClasses[size]}
        ${statusPositionClasses[size][statusPosition]}
      `}
      aria-label={`Status: ${status}`}
    />
  );

  return (
    <div
      className={`
        relative inline-flex items-center justify-center overflow-hidden
        ${sizeClasses[size]}
        ${shapeClasses[shape]}
        ${className}
      `}
      {...props}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt || ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-medium select-none`}
          aria-label={alt ? `Avatar de ${alt}` : 'Avatar'}
        >
          {initials}
        </div>
      )}
      {statusElement}
    </div>
  );
};

export const AvatarGroup: React.FC<{
  avatars: Array<{ src?: string; alt?: string; fallback?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}> = ({ avatars, max = 5, size = 'md', className = '' }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} aria-label={`${avatars.length} pessoas`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-[var(--bg-base)]"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            flex items-center justify-center
            ${sizeClasses[size]}
            ${shapeClasses.circle}
            bg-[var(--bg-input)]
            border-2 border-[var(--bg-base)]
            text-[var(--text-secondary)]
            font-medium
          `}
          aria-label={`${remainingCount} pessoas a mais`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;