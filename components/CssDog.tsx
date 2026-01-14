
import React from 'react';

interface CssDogProps {
  color?: string;
}

const CssDog: React.FC<CssDogProps> = ({ color = '#8b4513' }) => {
  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      {/* Body */}
      <div 
        className="absolute w-20 h-12 rounded-full bottom-2 left-6"
        style={{ backgroundColor: color }}
      />
      {/* Head */}
      <div 
        className="absolute w-12 h-10 rounded-full top-6 left-12"
        style={{ backgroundColor: color }}
      />
      {/* Ear */}
      <div 
        className="absolute w-6 h-8 rounded-b-full top-6 left-18 -rotate-12"
        style={{ backgroundColor: color }}
      />
      {/* Snout */}
      <div className="absolute w-4 h-3 bg-black rounded-full top-10 left-22" />
      {/* Legs */}
      <div className="absolute w-3 h-6 bottom-0 left-8" style={{ backgroundColor: color }} />
      <div className="absolute w-3 h-6 bottom-0 left-12" style={{ backgroundColor: color }} />
      <div className="absolute w-3 h-6 bottom-0 left-20" style={{ backgroundColor: color }} />
      <div className="absolute w-3 h-6 bottom-0 left-24" style={{ backgroundColor: color }} />
      {/* Tail */}
      <div 
        className="absolute w-8 h-2 rounded-full bottom-10 left-2 rotate-45"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default CssDog;
