import React from 'react';
import { ListIcon } from './icons/ListIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface MobileControlsProps {
    activeTab: 'playlist' | 'actions';
    setActiveTab: (tab: 'playlist' | 'actions') => void;
    isProcessing: boolean;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearPlaylist: () => void;
    playlistEmpty: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ 
    activeTab, 
    setActiveTab,
    isProcessing,
    onFileUpload,
    onClearPlaylist,
    playlistEmpty
}) => {
    return (
        <div className="flex-shrink-0 border-b-2 border-slate-700">
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
                <div className="p-4 bg-slate-800/50 flex flex-col sm:flex-row gap-4">
                    <label htmlFor="file-upload-mobile" className={`flex-1 text-center cursor-pointer bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Processing...' : 'Add Files'}
                    </label>
                    <input id="file-upload-mobile" type="file" accept="video/*,image/*" multiple onChange={onFileUpload} className="hidden" disabled={isProcessing} />

                    <button 
                        onClick={onClearPlaylist} 
                        disabled={playlistEmpty} 
                        className="flex-1 text-center bg-red-800/80 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
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
            ? 'bg-slate-800 text-teal-300 border-b-2 border-teal-400' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
        }`}
        aria-selected={isActive}
    >
        <span className="w-5 h-5">{icon}</span>
        {label}
    </button>
);