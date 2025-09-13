import React from 'react';

export const AspectRatioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12m0-8.25A8.25 8.25 0 0 1 11.25 3h1.5A8.25 8.25 0 0 1 21 11.25v1.5A8.25 8.25 0 0 1 12.75 21h-1.5A8.25 8.25 0 0 1 3 12.75v-1.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 15.75L18 18m0 0l2.25-2.25M18 18l-2.25 2.25M6 6l2.25 2.25M6 6l-2.25 2.25M6 6l2.25-2.25M6 18l2.25-2.25M6 18l-2.25-2.25M6 18l2.25 2.25M18 6l-2.25 2.25M18 6l2.25 2.25M18 6l-2.25-2.25"
    />
  </svg>
);