import React from 'react';
import { ListIcon } from './icons/ListIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MobileControlsProps {
    activeTab: 'playlist' | 'actions';
    setActiveTab: (tab: 'playlist' | 'actions') => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearPlaylist: () => void;
    onShowMemories: () => void;
    playlistEmpty: boolean;
    videoCount: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ 
    activeTab, 
    setActiveTab,
    onFileUpload,
    onClearPlaylist,
    onShowMemories,
    playlistEmpty,
    videoCount
}) => {
    return (
        <div className="flex-shrink-0 border-b-2 border-gray-800">
            <div className="flex">
                <TabButton 
                    label="Playlist" 
                    icon={<ListIcon />} 
                    isActive={activeTab === 'playlist'} 
                    onClick={() => setActiveTab('playlist')}
                />
                <TabButton 
                    label="Actions" 
                    icon={<PlusIcon />} 
                    isActive={activeTab === 'actions'} 
                    onClick={() => setActiveTab('actions')}
                />
            </div>
             {activeTab === 'actions' && (
                <div className="p-4 bg-gray-900/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label htmlFor="file-upload-mobile" className="text-center cursor-pointer bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/40 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Files
                    </label>
                    <input id="file-upload-mobile" type="file" accept="video/*,image/*" multiple onChange={onFileUpload} className="hidden" />

                    <button
                        onClick={onShowMemories}
                        disabled={videoCount < 2}
                        className="text-center cursor-pointer bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/40 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center disabled:bg-gray-800/50 disabled:border-gray-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                        title={videoCount < 2 ? "Add at least 2 videos" : "Create a memory"}
                    >
                         <SparklesIcon className="w-5 h-5 mr-2" />
                         Create Memory
                    </button>

                    <button 
                        onClick={onClearPlaylist} 
                        disabled={playlistEmpty} 
                        className="text-center bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 disabled:bg-gray-800/50 disabled:border-gray-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center"
                    >
                         <TrashIcon className="w-5 h-5 mr-2" />
                         Clear Playlist
                    </button>
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void}> = ({ label, icon, isActive, onClick }) => (
     <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 p-3 font-semibold transition-colors ${
            isActive 
            ? 'bg-gray-900 text-teal-300 border-b-2 border-teal-400' 
            : 'text-slate-400 hover:bg-gray-900/50 hover:text-white'
        }`}
        aria-selected={isActive}
    >
        <span className="w-5 h-5">{icon}</span>
        {label}
    </button>
);