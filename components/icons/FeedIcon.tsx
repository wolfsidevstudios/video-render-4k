import React from 'react';

export const FeedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <rect x="7.5" y="2.25" width="9" height="19.5" rx="1.5" />
  </svg>
);
