import React, { useState, useEffect, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';
import ImageViewer from './components/ImageViewer';
import { db } from './lib/db';

export interface PlaylistItem {
  id: number; // Use timestamp as a simple unique ID
  title: string;
  type: 'video' | 'image';
  src: string; // This will be a blob URL
}

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

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
        localStorage.removeItem('playlist_metadata');
        localStorage.removeItem('playlist_currentIndex');
      } finally {
        setIsReady(true);
      }
    };
    restorePlaylist();
  }, []);

  // Save playlist to storage whenever it changes
  useEffect(() => {
    if (!isReady) return; // Don't save during initial load
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

  const handleFileProcessing = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    const newItems: PlaylistItem[] = [];
    for (const file of Array.from(files)) {
      const fileType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
      if (fileType) {
        const id = Date.now() + Math.random(); // Create a unique enough ID
        await db.files.put({ id, blob: file });
        newItems.push({
          id,
          src: URL.createObjectURL(file),
          title: file.name,
          type: fileType,
        });
      }
    }

    if (newItems.length > 0) {
      setPlaylist(prev => [...prev, ...newItems]);
    } else {
      alert("Please select valid video or image files.");
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileProcessing(event.target.files);
    }
    event.target.value = ''; // Allow re-uploading the same file
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      handleFileProcessing(event.dataTransfer.files);
    }
  }, [handleFileProcessing]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleSelectVideo = (index: number) => setCurrentIndex(index);
  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % playlist.length);
  }, [playlist.length]);
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
  };

  const currentItem = playlist[currentIndex];

  if (!isReady) {
    return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white"><p>Loading Playlist...</p></div>;
  }

  return (
    <main 
      className="bg-slate-900 min-h-screen text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
       {isDragging && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center p-8 border-2 border-dashed border-cyan-400 rounded-2xl">
            <h2 className="text-2xl font-bold">Drop files to upload</h2>
          </div>
        </div>
      )}

      <div className="w-full max-w-8xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
            Multimedia Slideshow
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Build a persistent playlist of videos and images. Drag & drop files anywhere to start.
          </p>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3">
             <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl shadow-cyan-500/10 border border-slate-700 bg-black">
              {currentItem ? (
                currentItem.type === 'video' ? (
                  <VideoPlayer 
                    src={currentItem.src}
                    title={currentItem.title}
                    onEnded={handleNext}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    currentIndex={currentIndex}
                    playlistLength={playlist.length}
                  />
                ) : (
                  <ImageViewer
                    src={currentItem.src}
                    title={currentItem.title}
                    onEnded={handleNext}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p>Upload videos or images to begin.</p>
                </div>
              )}
            </div>
          </div>
          
          <aside className="lg:w-1/3 flex flex-col space-y-4">
             <div className="flex-shrink-0">
              <label htmlFor="file-upload" className="w-full text-center cursor-pointer bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                  Add Files to Playlist
              </label>
              <input id="file-upload" type="file" accept="video/*,image/*" multiple onChange={handleFileUpload} className="hidden" />
            </div>
            <Playlist videos={playlist} currentIndex={currentIndex} onSelectVideo={handleSelectVideo} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default App;
