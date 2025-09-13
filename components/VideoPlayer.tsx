
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { VolumeHighIcon } from './icons/VolumeHighIcon';
import { VolumeMuteIcon } from './icons/VolumeMuteIcon';
import { EnterFullScreenIcon } from './icons/EnterFullScreenIcon';
import { ExitFullScreenIcon } from './icons/ExitFullScreenIcon';
import { NextIcon } from './icons/NextIcon';
import { PreviousIcon } from './icons/PreviousIcon';

interface VideoPlayerProps {
  src: string;
  title: string;
  onEnded: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  playlistLength: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title, 
  onEnded,
  onNext,
  onPrevious,
  currentIndex,
  playlistLength
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);
  const [dominantColor, setDominantColor] = useState<string>('#000000');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with an initial value. `useRef()` must be called with one argument.
  const animationFrameRef = useRef<number | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
      return '00:00';
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const hideControls = useCallback(() => {
    if (isPlaying) {
      setAreControlsVisible(false);
    }
  }, [isPlaying]);

  const showControls = useCallback(() => {
    setAreControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, [hideControls]);

  // Effect to handle robust autoplay when src changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && src) {
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay was prevented by the browser.", error);
          setIsPlaying(false);
        });
      }
    }
  }, [src]);

  // Main Event Listeners Effect
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);

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
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, hideControls, onEnded]);
  
  // --- Ambient Lighting Feature ---

  const updateDominantColor = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended || video.videoWidth === 0) {
        if (!video || !video.paused) {
             if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
             }
             animationFrameRef.current = requestAnimationFrame(updateDominantColor);
        }
        return;
    }
    
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    const width = canvas.width = 20;
    const height = canvas.height = 20;
    
    context.drawImage(video, 0, 0, width, height);
    
    try {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let i = 0; i < data.length; i += 4 * 2) { // sample every other pixel for perf
            if (data[i] > 15 || data[i+1] > 15 || data[i+2] > 15) {
                r += data[i];
                g += data[i+1];
                b += data[i+2];
                count++;
            }
        }
        
        if (count > 0) {
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            setDominantColor(`rgb(${r}, ${g}, ${b})`);
        }
    } catch (e) {
        console.error("Could not get image data from canvas. This may be a cross-origin issue.", e);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        return;
    }
    
    animationFrameRef.current = requestAnimationFrame(updateDominantColor);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startColorExtraction = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(updateDominantColor);
    };

    const stopColorExtraction = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setDominantColor('#000000');
    };

    video.addEventListener('play', startColorExtraction);
    video.addEventListener('playing', startColorExtraction);
    video.addEventListener('pause', stopColorExtraction);
    video.addEventListener('ended', stopColorExtraction);
    video.addEventListener('error', stopColorExtraction);

    return () => {
        video.removeEventListener('play', startColorExtraction);
        video.removeEventListener('playing', startColorExtraction);
        video.removeEventListener('pause', stopColorExtraction);
        video.removeEventListener('ended', stopColorExtraction);
        video.removeEventListener('error', stopColorExtraction);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };
  }, [updateDominantColor]);

  // --- End Ambient Lighting Feature ---

  const togglePlayPause = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    }
    showControls();
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = Number(e.target.value);
      videoRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
        const newVolume = Number(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState) {
          setVolume(videoRef.current.volume > 0 ? videoRef.current.volume : 0.5);
          videoRef.current.volume = videoRef.current.volume > 0 ? videoRef.current.volume : 0.5;
        }
    }
  };
  
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full group transition-colors duration-1000" 
      style={{ backgroundColor: dominantColor }}
      onMouseMove={showControls}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onClick={togglePlayPause}
        onLoadedData={() => showControls()}
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'} bg-black bg-opacity-30`}
        style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
      >
        {!isPlaying && (
          <button onClick={togglePlayPause} aria-label="Play video" className="p-4 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
              <PlayIcon className="w-12 h-12 text-white" />
          </button>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${areControlsVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ pointerEvents: areControlsVisible ? 'auto' : 'none' }}>
        <div className="p-4 space-y-2">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-mono">{formatTime(progress)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1.5 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    aria-label="Video progress slider"
                />
                <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onPrevious} 
                        aria-label="Previous video" 
                        className="text-white hover:text-indigo-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={playlistLength <= 1}
                    >
                        <PreviousIcon className="w-6 h-6" />
                    </button>
                    <button onClick={togglePlayPause} aria-label={isPlaying ? 'Pause video' : 'Play video'} className="text-white hover:text-indigo-400 transition-colors">
                        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={onNext} 
                        aria-label="Next video" 
                        className="text-white hover:text-indigo-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={playlistLength <= 1}
                    >
                        <NextIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-2 w-28">
                        <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'} className="text-white hover:text-indigo-400 transition-colors">
                            {isMuted || volume === 0 ? <VolumeMuteIcon className="w-6 h-6"/> : <VolumeHighIcon className="w-6 h-6"/>}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-gray-500/50 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            aria-label="Volume slider"
                        />
                    </div>
                </div>
                 <div className="flex items-center space-x-4">
                     <p className="text-sm text-gray-300 truncate max-w-[100px] sm:max-w-xs" title={title}>{title}</p>
                     <button onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'} className="text-white hover:text-indigo-400 transition-colors">
                        {isFullScreen ? <ExitFullScreenIcon className="w-6 h-6" /> : <EnterFullScreenIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
