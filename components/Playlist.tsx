import React from 'react';
import { PlaylistItem } from '../App';
import { VideoIcon } from './icons/VideoIcon';
import { ImageIcon } from './icons/ImageIcon';

interface PlaylistProps {
  videos: PlaylistItem[];
  currentIndex: number;
  onSelectVideo: (index: number) => void;
  title?: string;
}

const Playlist: React.FC<PlaylistProps> = ({ videos, currentIndex, onSelectVideo, title }) => {
  return (
    <div className="bg-slate-800/30 rounded-lg p-2 sm:p-4 h-full flex-grow overflow-y-auto border border-slate-700/50">
        {title && <h2 className="text-lg font-bold text-slate-200 mb-4 px-2">{title}</h2>}
        {videos.length > 0 ? (
            <ul className="space-y-2">
                {videos.map((item, index) => {
                    const isActive = index === currentIndex;
                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => onSelectVideo(index)}
                                className={`w-full text-left p-3 rounded-md transition-all duration-200 flex items-center space-x-3 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                                    isActive 
                                    ? 'bg-slate-700/80 text-white shadow-lg' 
                                    : 'bg-slate-700/30 hover:bg-slate-700/60 text-slate-300'
                                }`}
                                aria-current={isActive ? 'true' : 'false'}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400"></div>}
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-slate-400">
                                  {item.type === 'video' ? <VideoIcon /> : <ImageIcon />}
                                </div>
                                <span className={`flex-grow truncate ${isActive ? 'font-semibold text-teal-300' : ''}`} title={item.title}>
                                    {item.title}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p className="text-slate-400 text-center py-4">Your playlist is empty.</p>
        )}
    </div>
  );
};

export default Playlist;