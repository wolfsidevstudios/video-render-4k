import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';

export interface Video {
  src: string;
  title: string;
}

const App: React.FC = () => {
  const sampleVideo: Video = {
    src: "https://videos.pexels.com/video-files/4784090/4784090-hd_1920_1080_25fps.mp4",
    title: "Pexels 4K Nature"
  };

  const [playlist, setPlaylist] = useState<Video[]>([sampleVideo]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Effect to clean up all created Object URLs when the component unmounts
  useEffect(() => {
    return () => {
      playlist.forEach(video => {
        if (video.src.startsWith('blob:')) {
          URL.revokeObjectURL(video.src);
        }
      });
    };
  }, [playlist]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newVideos: Video[] = Array.from(files)
        .filter(file => file.type.startsWith('video/'))
        .map(file => ({
          src: URL.createObjectURL(file),
          title: file.name
        }));
      
      if(newVideos.length === 0) {
        alert("Please select valid video files.");
        return;
      }

      setPlaylist(prev => [...prev, ...newVideos]);
    }
    // Reset the input value to allow uploading the same file(s) again
    event.target.value = '';
  };

  const handleSelectVideo = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNextVideo = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % playlist.length);
  };
  
  const handlePreviousVideo = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const currentVideo = playlist[currentIndex];

  return (
    <main className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            UltraHD Video Slideshow
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Create your own video playlist. Videos will automatically play one after another.
          </p>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content: Player */}
          <div className="flex-grow lg:w-2/3">
             <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-gray-700">
              {currentVideo ? (
                <VideoPlayer 
                  key={currentVideo.src}
                  src={currentVideo.src}
                  title={currentVideo.title}
                  onEnded={handleNextVideo}
                  onNext={handleNextVideo}
                  onPrevious={handlePreviousVideo}
                  currentIndex={currentIndex}
                  playlistLength={playlist.length}
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <p>Upload videos to begin.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar: Playlist and Upload */}
          <aside className="lg:w-1/3 flex flex-col space-y-4">
            <div className="flex-shrink-0">
              <label htmlFor="video-upload" className="w-full text-center cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center">
                  Add Videos to Playlist
              </label>
              <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
              />
            </div>
            <Playlist 
              videos={playlist}
              currentIndex={currentIndex}
              onSelectVideo={handleSelectVideo}
            />
          </aside>
        </div>

        <footer className="text-center mt-8 text-gray-500">
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </div>
    </main>
  );
};

export default App;
