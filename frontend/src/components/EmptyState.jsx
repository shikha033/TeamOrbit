import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action, testId }) => (
  <div
    data-testid={testId || 'empty-state'}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-white/10 flex items-center justify-center mb-6">
        <Icon size={26} className="text-purple-300" />
      </div>
    )}
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-slate-400 max-w-md mb-6">{description}</p>
    {action}
  </div>
);

export default EmptyState;
