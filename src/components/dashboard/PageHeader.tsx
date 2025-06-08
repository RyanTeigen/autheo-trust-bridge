
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="text-slate-100">{icon}</div>}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">{title}</h1>
        <p className="text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
