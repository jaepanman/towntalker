
import React from 'react';

interface LocationIconProps {
  id: string;
}

const LocationIcon: React.FC<LocationIconProps> = ({ id }) => {
  switch (id) {
    case 'conv_store':
      return (
        <div className="relative w-10 h-8 bg-white border-2 border-emerald-600 rounded-sm">
          <div className="absolute top-0 w-full h-2 bg-emerald-500" />
          <div className="absolute bottom-1 left-1 w-2 h-3 bg-emerald-200" />
          <div className="absolute bottom-1 right-1 w-4 h-1 bg-orange-400" />
        </div>
      );
    case 'supermarket':
      return (
        <div className="relative w-10 h-8 bg-green-100 border-2 border-green-700 rounded-sm">
          <div className="absolute top-1 left-2 w-6 h-4 border-2 border-green-600 rounded-md flex items-center justify-center">
            <div className="w-4 h-1 bg-green-400" />
          </div>
          <div className="absolute bottom-0 w-full h-1 bg-green-600" />
        </div>
      );
    case 'post_office':
      return (
        <div className="relative w-10 h-8 bg-red-100 border-2 border-red-600 rounded-sm">
          <div className="absolute top-1 left-1 w-8 h-5 bg-white border border-red-400" />
          <div className="absolute top-1 left-1 w-8 h-5 flex items-center justify-center text-[10px] text-red-600 font-bold">✉</div>
        </div>
      );
    case 'bank':
      return (
        <div className="relative w-10 h-8 bg-blue-100 border-2 border-blue-800 rounded-sm">
          <div className="absolute top-0 w-full h-1 bg-blue-800" />
          <div className="flex justify-around items-end h-full pb-1 px-1">
            <div className="w-1 h-4 bg-blue-400" />
            <div className="w-1 h-4 bg-blue-400" />
            <div className="w-1 h-4 bg-blue-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-800 font-black text-xs">$</div>
        </div>
      );
    case 'school':
      return (
        <div className="relative w-10 h-8 bg-yellow-100 border-2 border-yellow-600 rounded-sm">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full border border-yellow-700 flex items-center justify-center text-[6px]">⏰</div>
          <div className="absolute bottom-0 w-full h-2 bg-yellow-600" />
          <div className="absolute top-2 left-2 w-2 h-2 bg-white" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-white" />
        </div>
      );
    case 'park':
      return (
        <div className="relative w-10 h-8 flex items-end justify-center gap-1">
          <div className="w-4 h-6 bg-emerald-500 rounded-full border border-emerald-700" />
          <div className="w-3 h-2 bg-amber-700 rounded-sm" />
          <div className="w-2 h-4 bg-emerald-400 rounded-full border border-emerald-600" />
        </div>
      );
    case 'fire_station':
      return (
        <div className="relative w-10 h-8 bg-orange-100 border-2 border-orange-700 rounded-sm">
          <div className="absolute bottom-0 left-1 w-4 h-6 bg-red-600 rounded-t-md" />
          <div className="absolute top-1 right-1 w-3 h-1 bg-slate-400 rotate-45" />
          <div className="absolute top-2 right-2 w-1 h-4 bg-slate-400 -rotate-12" />
        </div>
      );
    case 'police_station':
      return (
        <div className="relative w-10 h-8 bg-sky-100 border-2 border-sky-800 rounded-sm">
          <div className="absolute inset-2 bg-sky-600 rounded-full flex items-center justify-center">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
          <div className="absolute top-0 w-full h-1 bg-sky-800" />
        </div>
      );
    case 'mall':
      return (
        <div className="relative w-10 h-8 bg-pink-100 border-2 border-pink-600 rounded-sm">
          <div className="absolute top-1 left-1 w-3 h-3 bg-white border border-pink-300" />
          <div className="absolute top-1 right-1 w-3 h-3 bg-white border border-pink-300" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-pink-400" />
        </div>
      );
    case 'stadium':
      return (
        <div className="relative w-10 h-8 bg-indigo-100 border-2 border-indigo-700 rounded-full overflow-hidden">
          <div className="absolute inset-1 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
             <div className="w-full h-[1px] bg-white opacity-50" />
          </div>
        </div>
      );
    case 'train_station':
      return (
        <div className="relative w-10 h-8 bg-slate-100 border-2 border-slate-600 rounded-sm">
          <div className="absolute bottom-1 w-full h-1 bg-slate-400" />
          <div className="absolute bottom-2 w-full h-1 bg-slate-400" />
          <div className="absolute inset-0 flex items-center justify-center">🚂</div>
        </div>
      );
    case 'yen_store':
      return (
        <div className="relative w-10 h-8 bg-yellow-200 border-2 border-yellow-700 rounded-sm flex items-center justify-center">
          <div className="text-[10px] font-black text-yellow-800">100¥</div>
        </div>
      );
    default:
      return <div className="w-8 h-8 bg-slate-300 rounded-sm" />;
  }
};

export default LocationIcon;
