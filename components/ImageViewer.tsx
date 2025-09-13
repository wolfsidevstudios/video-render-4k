import React, { useEffect } from 'react';

interface ImageViewerProps {
  src: string;
  title: string;
  onEnded: () => void;
}

const IMAGE_DURATION_MS = 5000; // Display each image for 5 seconds

const ImageViewer: React.FC<ImageViewerProps> = ({ src, title, onEnded }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnded();
    }, IMAGE_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [src, onEnded]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative">
      <img
        src={src}
        alt={title}
        className="max-w-full max-h-full object-contain"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-white text-sm text-center truncate">{title}</p>
      </div>
    </div>
  );
};

export default ImageViewer;
