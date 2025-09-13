import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { VolumeHighIcon } from './icons/VolumeHighIcon';
import { VolumeMuteIcon } from './icons/VolumeMuteIcon';
import { EnterFullScreenIcon } from './icons/EnterFullScreenIcon';
import { ExitFullScreenIcon } from './icons/ExitFullScreenIcon';
import { NextIcon } from './icons/NextIcon';
import { PreviousIcon } from './icons/PreviousIcon';
import { AspectRatioIcon } from './icons/AspectRatioIcon';
import { FeedIcon } from './icons/FeedIcon';

interface VideoPlayerProps {
  src: string;
  title: string;
  onEnded: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  playlistLength: number;
  itemType: 'video' | 'image';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title, 
  onEnded,
  onNext,
  onPrevious,
  currentIndex,
  playlistLength,
  itemType
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [fullscreenView, setFullscreenView] = useState<'default' | 'feed'>('default');

  const videoRef = useRef<HTMLVideoElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const hideControls = useCallback(() => { if (isPlaying) setAreControlsVisible(false); }, [isPlaying]);
  const showControls = useCallback(() => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    const mainVideo = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (mainVideo && bgVideo && src) {
      mainVideo.load();
      bgVideo.load();
      const playPromise = mainVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => bgVideo.play()).catch(() => setIsPlaying(false));
      }
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    const container = containerRef.current;
    if (!video || !container || !bgVideo) return;

    const handleTimeUpdate = () => {
      setProgress(video.currentTime);
      if (Math.abs(video.currentTime - bgVideo.currentTime) > 0.5) bgVideo.currentTime = video.currentTime;
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => { setIsPlaying(true); bgVideo.play(); };
    const handlePause = () => { setIsPlaying(false); bgVideo.pause(); };
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullScreen(isFs);
      if (!isFs) {
        setFullscreenView('default'); // Reset on exit
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', onEnded);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    container.addEventListener('mousemove', showControls);
    container.addEventListener('mouseleave', hideControls);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      container.removeEventListener('mousemove', showControls);
      container.removeEventListener('mouseleave', hideControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, hideControls, onEnded]);
  
  const togglePlayPause = () => {
    const mainVideo = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (mainVideo && bgVideo) {
      mainVideo.paused ? mainVideo.play() : mainVideo.pause();
    }
    showControls();
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mainVideo = videoRef.current;
    const bgVideo = backgroundVideoRef.current;
    if (mainVideo && bgVideo) {
      const newTime = Number(e.target.value);
      mainVideo.currentTime = newTime; bgVideo.currentTime = newTime; setProgress(newTime);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
        const newVolume = Number(e.target.value);
        videoRef.current.volume = newVolume; setVolume(newVolume); setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState; setIsMuted(newMutedState);
        if (!newMutedState && videoRef.current.volume === 0) {
          videoRef.current.volume = 0.5; setVolume(0.5);
        }
    }
  };
  
  const toggleFullScreen = () => {
    if (containerRef.current) {
      !document.fullscreenElement ? containerRef.current.requestFullscreen() : document.exitFullscreen();
    }
  };

  const toggleFitMode = () => {
    setFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
    showControls();
  };
  
  const toggleFeedMode = () => {
    setFullscreenView(prev => prev === 'default' ? 'feed' : 'default');
    showControls();
  };

  const renderControls = () => (
    <>
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'} bg-black/30`} style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}>
        {!isPlaying && <button onClick={togglePlayPause} aria-label="Play" className="p-4 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"><PlayIcon className="w-12 h-12 text-white" /></button>}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${areControlsVisible ? 'opacity-100' : 'opacity-0'}`} style={{ pointerEvents: areControlsVisible ? 'auto' : 'none' }}>
        <div className="p-2 sm:p-4 space-y-2">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-mono">{formatTime(progress)}</span>
                <input type="range" min="0" max={duration || 0} value={progress} onChange={handleProgressChange} className="w-full h-1.5 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-teal-400" aria-label="Video progress"/>
                <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={onPrevious} aria-label="Previous" className="text-white hover:text-teal-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed" disabled={playlistLength <= 1}><PreviousIcon className="w-6 h-6" /></button>
                    <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} className="text-white hover:text-teal-300 transition-colors">{isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}</button>
                    <button onClick={onNext} aria-label="Next" className="text-white hover:text-teal-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed" disabled={playlistLength <= 1}><NextIcon className="w-6 h-6" /></button>
                    <div className="flex items-center space-x-2 w-24 sm:w-28">
                        <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'} className="text-white hover:text-teal-300 transition-colors">{isMuted || volume === 0 ? <VolumeMuteIcon className="w-6 h-6"/> : <VolumeHighIcon className="w-6 h-6"/>}</button>
                        <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-teal-400" aria-label="Volume"/>
                    </div>
                </div>
                 <div className="flex items-center space-x-2 sm:space-x-4">
                     <p className="text-sm text-gray-300 truncate max-w-[80px] sm:max-w-xs" title={title}>{title}</p>
                     
                     {!(isFullScreen && fullscreenView === 'feed') &&
                       <button onClick={toggleFitMode} aria-label={fitMode === 'contain' ? 'Fill' : 'Fit'} className="text-white hover:text-teal-300 transition-colors"><AspectRatioIcon className="w-6 h-6" /></button>
                     }

                     {isFullScreen && itemType === 'video' && (
                        <button onClick={toggleFeedMode} aria-label={fullscreenView === 'default' ? 'Enter Feed View' : 'Exit Feed View'} className={`transition-colors ${fullscreenView === 'feed' ? 'text-teal-400' : 'text-white hover:text-teal-300'}`}>
                          <FeedIcon className="w-6 h-6" />
                        </button>
                     )}

                     <button onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'} className="text-white hover:text-teal-300 transition-colors">{isFullScreen ? <ExitFullScreenIcon className="w-6 h-6" /> : <EnterFullScreenIcon className="w-6 h-6" />}</button>
                </div>
            </div>
        </div>
      </div>
    </>
  );

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full group bg-black overflow-hidden ${isFullScreen && fullscreenView === 'feed' ? 'flex items-center justify-center' : ''}`} 
      onMouseMove={showControls}
    >
      {isFullScreen && fullscreenView === 'feed' ? (
        <>
          {/* Feed Mode Background */}
          <video 
            ref={backgroundVideoRef} 
            src={src} 
            className="absolute inset-0 w-full h-full object-cover blur-3xl brightness-75 pointer-events-none animate-aurora" 
            muted 
          />
          {/* Feed Mode Player */}
          <div className="relative h-[95%] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-300">
            <video 
              ref={videoRef} 
              src={src} 
              className="relative w-full h-full object-cover" 
              onClick={togglePlayPause} 
              onLoadedData={showControls} 
            />
            {renderControls()}
          </div>
        </>
      ) : (
        <div className="relative w-full h-full">
          {/* Default Mode Background */}
          <video 
            ref={backgroundVideoRef} 
            src={src} 
            className="absolute top-0 left-0 w-full h-full object-cover blur-2xl scale-110 brightness-50 pointer-events-none" 
            muted 
          />
          {/* Default Mode Player */}
          <video 
            ref={videoRef} 
            src={src} 
            className={`relative w-full h-full transition-all duration-300 ${fitMode === 'cover' ? 'object-cover' : 'object-contain'}`}
            onClick={togglePlayPause} 
            onLoadedData={showControls} 
          />
          {renderControls()}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;