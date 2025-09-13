import React from 'react';
import { Video } from '../App';
import { PlayIcon } from './icons/PlayIcon';

interface PlaylistProps {
  videos: Video[];
  currentIndex: number;
  onSelectVideo: (index: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ videos, currentIndex, onSelectVideo }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 h-full max-h-[60vh] lg:max-h-full overflow-y-auto border border-gray-700">
        <h2 className="text-lg font-bold text-gray-200 mb-4">Up Next</h2>
        {videos.length > 0 ? (
            <ul className="space-y-2">
                {videos.map((video, index) => {
                    const isActive = index === currentIndex;
                    return (
                        <li key={video.src}>
                            <button
                                onClick={() => onSelectVideo(index)}
                                className={`w-full text-left p-3 rounded-md transition-colors flex items-center space-x-3 ${
                                    isActive 
                                    ? 'bg-indigo-600/80 text-white shadow-lg' 
                                    : 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300'
                                }`}
                                aria-current={isActive ? 'true' : 'false'}
                            >
                                {isActive && <PlayIcon className="w-5 h-5 flex-shrink-0" />}
                                <span className={`flex-grow truncate ${isActive ? 'font-semibold' : ''}`} title={video.title}>
                                    {video.title}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p className="text-gray-400 text-center py-4">Your playlist is empty.</p>
        )}
    </div>
  );
};

export default Playlist;
