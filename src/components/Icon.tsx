import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

type IconProps = {
  name: IconName;
  size?: number; // dp, default 48
  color?: string;
  ariaLabel?: string;
};

// Color palette constants (high contrast)
export const COLORS = {
  SUCCESS: '#00875A', // Deep Forest Green
  WARNING: '#D97706', // Amber/Orange
  ERROR: '#DC2626',   // Bright Crimson Red
  BACKGROUND: '#FFFFFF',
  TEXT: '#0F172A',
};

export const Icon: React.FC<IconProps> = ({ name, size = 48, color = COLORS.TEXT, ariaLabel }) => {
  const IconComponent = (LucideIcons as any)[name] as React.ComponentType<any>;
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }
  // Force minimum stroke width of 2.5px via style override
  const style = {
    strokeWidth: 2.5,
    // Ensure crisp rendering on low‑res LCDs
    minWidth: `${size}px`,
    minHeight: `${size}px`,
  } as React.CSSProperties;
  return (
    <IconComponent
      size={size}
      color={color}
      aria-label={ariaLabel}
      style={style}
    />
  );
};

export default Icon;
