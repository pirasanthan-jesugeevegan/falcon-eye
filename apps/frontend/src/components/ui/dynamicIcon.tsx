import type { FC } from 'react';
import * as HIcons from '@heroicons/react/24/solid';

interface DynamicHeroIconProps {
  icon: keyof typeof HIcons; // ensures only valid keys are allowed
  className?: string;
}

const DynamicHeroIcon: FC<DynamicHeroIconProps> = ({ icon, className }) => {
  // Type guard: only allow string keys that exist in HIcons
  const iconKey = typeof icon === 'symbol' ? String(icon) : icon;
  const IconComponent = HIcons[iconKey as keyof typeof HIcons];

  if (!IconComponent) {
    console.warn(`Icon "${icon}" not found in Heroicons`);
    return null;
  }

  return (
    <IconComponent className={className ?? 'h-6 w-6'} aria-hidden="true" />
  );
};

export default DynamicHeroIcon;
