
import React from 'react';

interface AutheoLogoProps {
  className?: string;
}

const AutheoLogo: React.FC<AutheoLogoProps> = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke="#0284c7" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      <path 
        d="M12 16L16 11H13V8L9 13H12V16Z" 
        fill="#0284c7" 
        stroke="#0284c7" 
        strokeWidth="0.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M4 12C4 7.58172 7.58172 4 12 4" 
        stroke="#14b8a6" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M20 12C20 16.4183 16.4183 20 12 20" 
        stroke="#14b8a6" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AutheoLogo;
