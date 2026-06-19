import React from 'react';
import { roleStyles } from '../../utils/blogConstants';

/**
 * Component hiển thị badge role (Admin / Instructor / Student)
 * 
 * @param {string} role - Role của user ('admin' | 'instructor' | 'student')
 * @param {string} className - Additional CSS classes
 */
const RoleBadge = ({ role, className = '' }) => {
  const style = roleStyles[role] ?? roleStyles.student;
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.badgeClass} ${className}`}
    >
      {style.label}
    </span>
  );
};

export default RoleBadge;

