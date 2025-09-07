
import React from 'react';
import { PhotoIcon } from './icons';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl }) => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-center text-gray-700 mb-4">{title}</h2>
      <div className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-gray-400">
            <PhotoIcon className="mx-auto h-16 w-16" />
            <p className="mt-2">이미지가 여기에 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
};
