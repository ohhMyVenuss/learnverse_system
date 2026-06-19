import React from 'react';
import { FiCheckCircle, FiZap, FiAlertTriangle } from 'react-icons/fi';

const difficultyConfig = {
  EASY: {
    label: 'Dễ',
    color: 'bg-green-100 text-green-800 border-green-300',
    Icon: FiCheckCircle,
  },
  MEDIUM: {
    label: 'Trung bình',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Icon: FiZap,
  },
  HARD: {
    label: 'Khó',
    color: 'bg-red-100 text-red-800 border-red-300',
    Icon: FiAlertTriangle,
  },
};

function DifficultyBadge({ difficulty, size = 'default' }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.MEDIUM;
  const IconComponent = config.Icon;
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <IconComponent className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
}

export default DifficultyBadge;

