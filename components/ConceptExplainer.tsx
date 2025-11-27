import React from 'react';
import { Info, X, Lightbulb } from 'lucide-react';

interface ConceptExplainerProps {
  title: string;
  description: string;
  analogy: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ title, description, analogy, icon, onClose, className = "" }) => {
  return (
    <div className={`bg-slate-800/90 backdrop-blur-sm border-l-4 border-indigo-500 rounded-r-xl p-5 relative overflow-hidden shadow-lg animate-fadeIn ${className}`}>
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      )}
      <div className="flex gap-4">
        <div className="shrink-0">
             <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300">
                {icon || <Info size={24} />}
            </div>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-indigo-200 text-lg mb-2 flex items-center gap-2">
            {title}
          </h4>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">{description}</p>
          
          <div className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-500/20 flex gap-3">
            <div className="mt-0.5">
                <Lightbulb size={16} className="text-yellow-400" />
            </div>
            <div>
                <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Think of it like this:</span>
                <p className="text-indigo-100 text-sm italic">"{analogy}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptExplainer;