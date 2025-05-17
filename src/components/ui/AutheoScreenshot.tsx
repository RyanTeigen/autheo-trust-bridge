
import React from 'react';

const AutheoScreenshot: React.FC = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-xl max-w-4xl border border-autheo-primary/30">
      <img 
        src="/autheo-screenshot.png" 
        alt="Autheo Platform" 
        className="w-full h-auto"
      />
    </div>
  );
};

export default AutheoScreenshot;
