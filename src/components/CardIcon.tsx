import React from 'react';
import {
  Zap,
  Atom,
  Flame,
  Shield,
  Cpu,
  Compass,
  Globe,
  Sparkles,
  Target,
  Radio,
  Dna,
  Boxes,
  HelpCircle,
} from 'lucide-react';

interface CardIconProps {
  name: string;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Atom,
  Flame,
  Shield,
  Cpu,
  Compass,
  Globe,
  Sparkles,
  Target,
  Radio,
  Dna,
  Boxes,
};

export const CardIcon: React.FC<CardIconProps> = ({ name, className = 'w-8 h-8' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
