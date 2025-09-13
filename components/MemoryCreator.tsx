import React, { useEffect } from 'react';
import { PlaylistItem } from '../App';
import { useVideoMerger } from '../hooks/useVideoMerger';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface MemoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  videoPlaylist: PlaylistItem[];
}

const MemoryCreator: React.FC<MemoryCreatorProps> = ({ isOpen, onClose, videoPlaylist }) => {
  const { status, progress, generatedUrl, createMemoryVideo, reset } = useVideoMerger();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleGenerate = () => {
    createMemoryVideo(videoPlaylist);
  };

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
      case 'processing':
        return (
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <svg className="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Creating Your Memory</h3>
            <p className="text-slate-400">{progress.message}</p>
            <p className="text-xs text-slate-500 mt-4">Please keep this tab open. This may take a few moments.</p>
          </div>
        );
      case 'complete':
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">Your Memory is Ready!</h3>
            {generatedUrl && (
              <video src={generatedUrl} controls className="w-full rounded-lg mb-4 aspect-video"></video>
            )}
            <a
              href={generatedUrl ?? '#'}
              download="memory-video.mp4"
              className="w-full text-center cursor-pointer bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/40 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download
            </a>
          </div>
        );
      case 'error':
        return (
            <div className="text-center">
                <h3 className="text-xl font-semibold text-red-400 mb-2">Something Went Wrong</h3>
                <p className="text-slate-400">{progress.message}</p>
                <button onClick={handleGenerate} className="mt-4 text-center cursor-pointer bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/40 text-white font-bold py-2 px-5 rounded-full shadow-lg transition-all">
                    Try Again
                </button>
            </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center">
            <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Create a Memory</h3>
            <p className="text-slate-400 mb-6">Automatically create a short video montage from the clips in your playlist.</p>
            <button
              onClick={handleGenerate}
              className="w-full text-center cursor-pointer bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/40 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Generate Memory
            </button>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8 w-full max-w-md m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MemoryCreator;