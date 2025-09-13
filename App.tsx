import React, { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import ImageViewer from './components/ImageViewer';
import { MobileControls } from './components/MobileControls';
import { db } from './lib/db';

export interface PlaylistItem {
  id: number; 
  title: string;
  type: 'video' | 'image';
  src: string; // This will be a blob URL
}

let lastId = Date.now();
function generateUniqueId() {
  const now = Date.now();
  lastId = now > lastId ? now : lastId + 1;
  return lastId;
}

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'playlist' | 'actions'>('playlist');

  // Load playlist from storage on initial mount
  useEffect(() => {
    const restorePlaylist = async () => {
      try {
        const metadata = JSON.parse(localStorage.getItem('playlist_metadata') || '[]');
        const currentIdx = parseInt(localStorage.getItem('playlist_currentIndex') || '0', 10);

        if (metadata.length > 0) {
          const restoredPlaylist: PlaylistItem[] = [];
          for (const item of metadata) {
            const file = await db.files.get(item.id);
            if (file) {
              restoredPlaylist.push({ ...item, src: URL.createObjectURL(file.blob) });
            }
          }
          setPlaylist(restoredPlaylist);
          setCurrentIndex(currentIdx < restoredPlaylist.length ? currentIdx : 0);
        }
      } catch (error) {
        console.error("Failed to restore playlist:", error);
      } finally {
        setIsReady(true);
      }
    };
    restorePlaylist();
  }, []);

  // Save playlist to storage whenever it changes
  useEffect(() => {
    if (!isReady) return;
    const metadata = playlist.map(({ id, title, type }) => ({ id, title, type }));
    localStorage.setItem('playlist_metadata', JSON.stringify(metadata));
    localStorage.setItem('playlist_currentIndex', String(currentIndex));
  }, [playlist, currentIndex, isReady]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      playlist.forEach(item => {
        if (item.src.startsWith('blob:')) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, [playlist]);

  const handleFileProcessing = useCallback((files: FileList) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newItems: PlaylistItem[] = [];
    const filesToSave: { id: number; blob: File }[] = [];

    for (const file of fileArray) {
      const fileType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
      if (fileType) {
        const id = generateUniqueId();
        newItems.push({ id, src: URL.createObjectURL(file), title: file.name, type: fileType });
        filesToSave.push({ id, blob: file });
      }
    }
    
    if (newItems.length > 0) {
      setPlaylist(prev => [...prev, ...newItems]);

      // Save to DB in the background without blocking UI
      (async () => {
        try {
          await db.files.bulkPut(filesToSave);
        } catch (error) {
          console.error("Failed to save files to database in background:", error);
        }
      })();

      if (newItems.length < fileArray.length) {
        alert(`Added ${newItems.length} files. Some files were not valid video or image formats and were skipped.`);
      }
    } else {
      alert("No valid video or image files were found in your selection.");
    }
  }, []);

  const handleClearPlaylist = async () => {
    if (window.confirm("Are you sure you want to clear the entire playlist? This cannot be undone.")) {
      try {
        playlist.forEach(item => URL.revokeObjectURL(item.src));
        setPlaylist([]);
        setCurrentIndex(0);
        await db.clearAll();
        localStorage.removeItem('playlist_metadata');
        localStorage.removeItem('playlist_currentIndex');
      } catch (error) {
        console.error("Failed to clear playlist:", error);
        alert("An error occurred while clearing the playlist.");
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFileProcessing(event.target.files);
    event.target.value = '';
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) handleFileProcessing(event.dataTransfer.files);
  }, [handleFileProcessing]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleSelectVideo = (index: number) => setCurrentIndex(index);
  const handleNext = useCallback(() => setCurrentIndex(prev => (prev + 1) % playlist.length), [playlist.length]);
  const handlePrevious = () => setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);

  const currentItem = playlist[currentIndex];

  if (!isReady) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white"><p>Loading...</p></div>;
  }

  return (
    <main 
      className="bg-black min-h-screen text-white font-sans"
      onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center p-8 border-2 border-dashed border-teal-400 rounded-2xl">
            <h2 className="text-2xl font-bold text-teal-300">Drop files to upload</h2>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-grow flex flex-col p-2 sm:p-4 lg:w-2/3">
          <header className="text-center mb-4 flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">
              Multimedia Slideshow
            </h1>
          </header>
          <div className="flex-grow flex items-center justify-center min-h-0">
            <div className="aspect-video w-full max-w-full rounded-lg overflow-hidden shadow-2xl shadow-teal-500/10 border border-gray-800 bg-black">
              {currentItem ? (
                currentItem.type === 'video' ? (
                  <VideoPlayer 
                    src={currentItem.src} title={currentItem.title} onEnded={handleNext}
                    onNext={handleNext} onPrevious={handlePrevious}
                    currentIndex={currentIndex} playlistLength={playlist.length}
                    itemType={currentItem.type}
                  />
                ) : (
                  <ImageViewer src={currentItem.src} title={currentItem.title} onEnded={handleNext} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 p-4">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold">Playlist is empty</h2>
                    <p className="mt-2 text-sm">Drag & drop files anywhere or use the 'Add Files' button to start.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <aside className="lg:w-1/3 flex flex-col bg-gray-950/50 backdrop-blur-sm border-t-2 lg:border-t-0 lg:border-l-2 border-gray-800">
          {/* Desktop View */}
          <div className="hidden lg:flex flex-col h-full p-4 space-y-4">
            <label htmlFor="file-upload-desktop" className="w-full text-center cursor-pointer bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/40 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                Add Files
            </label>
            <input id="file-upload-desktop" type="file" accept="video/*,image/*" multiple onChange={handleFileUpload} className="hidden" />
            <Playlist videos={playlist} currentIndex={currentIndex} onSelectVideo={handleSelectVideo} title="Up Next"/>
            <div className="mt-auto flex-shrink-0 pt-4 border-t border-gray-800">
               <button onClick={handleClearPlaylist} disabled={playlist.length === 0} className="w-full text-center bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 disabled:bg-gray-800/50 disabled:border-gray-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-full transition-colors">
                  Clear Playlist
               </button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden flex flex-col h-full">
            <MobileControls
              activeTab={activeMobileTab}
              setActiveTab={setActiveMobileTab}
              onFileUpload={handleFileUpload}
              onClearPlaylist={handleClearPlaylist}
              playlistEmpty={playlist.length === 0}
            />
            <div className="flex-grow overflow-y-auto p-2">
              {activeMobileTab === 'playlist' && (
                <Playlist videos={playlist} currentIndex={currentIndex} onSelectVideo={handleSelectVideo}/>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default App;