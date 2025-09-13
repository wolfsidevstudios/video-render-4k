import { useState, useRef, useCallback } from 'react';
import { PlaylistItem } from '../App';
import { db } from '../lib/db';

declare var FFmpeg: any;

type Status = 'idle' | 'loading' | 'processing' | 'complete' | 'error';
interface Progress {
  message: string;
  ratio?: number;
}

export const useVideoMerger = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState<Progress>({ message: '' });
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<any>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegRef.current.isLoaded()) {
      return ffmpegRef.current;
    }
    setStatus('loading');
    setProgress({ message: 'Loading video engine...' });
    const ffmpeg = FFmpeg.createFFmpeg({ 
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
    });
    await ffmpeg.load();
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  const createMemoryVideo = useCallback(async (videos: PlaylistItem[]) => {
    if (videos.length < 2) {
      setStatus('error');
      setProgress({ message: 'Not enough videos to create a memory.' });
      return;
    }

    try {
      const ffmpeg = await loadFFmpeg();
      setStatus('processing');

      const selectedVideos = videos.slice(0, 5); // Use up to 5 videos
      const clipDuration = 3;
      const clipStartTime = 3;
      const clipNames: string[] = [];

      // 1. Write files to FS
      setProgress({ message: `Fetching video data (1/${selectedVideos.length})` });
      for (let i = 0; i < selectedVideos.length; i++) {
        setProgress({ message: `Fetching video data (${i + 1}/${selectedVideos.length})` });
        const video = selectedVideos[i];
        const fileRecord = await db.files.get(video.id);
        if (fileRecord) {
            const fileData = await FFmpeg.fetchFile(fileRecord.blob);
            ffmpeg.FS('writeFile', `input_${i}.mp4`, fileData);
        }
      }

      // 2. Trim clips
      setProgress({ message: `Preparing clips (1/${selectedVideos.length})` });
      for (let i = 0; i < selectedVideos.length; i++) {
         setProgress({ message: `Preparing clips (${i + 1}/${selectedVideos.length})` });
         const outputName = `clip_${i}.mp4`;
         await ffmpeg.run('-i', `input_${i}.mp4`, '-ss', String(clipStartTime), '-t', String(clipDuration), '-c', 'copy', outputName);
         clipNames.push(outputName);
      }
      
      // 3. Concatenate clips
      setProgress({ message: 'Stitching video...' });
      const fileList = clipNames.map(name => `file '${name}'`).join('\n');
      ffmpeg.FS('writeFile', 'filelist.txt', fileList);
      
      await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-c', 'copy', 'output.mp4');

      // 4. Read result and create URL
      setProgress({ message: 'Finalizing...' });
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      
      setGeneratedUrl(url);
      setStatus('complete');
      setProgress({ message: 'Your memory is ready!' });

      // Cleanup
      try {
        clipNames.forEach(name => ffmpeg.FS('unlink', name));
        selectedVideos.forEach((_, i) => ffmpeg.FS('unlink', `input_${i}.mp4`));
        ffmpeg.FS('unlink', 'filelist.txt');
        ffmpeg.FS('unlink', 'output.mp4');
      } catch (e) {
        console.warn("Could not cleanup ffmpeg filesystem.", e);
      }

    } catch (error) {
      console.error('Error creating memory video:', error);
      setStatus('error');
      setProgress({ message: 'An unexpected error occurred.' });
    }
  }, [loadFFmpeg]);

  const reset = () => {
    if (generatedUrl) {
      URL.revokeObjectURL(generatedUrl);
    }
    setStatus('idle');
    setProgress({ message: '' });
    setGeneratedUrl(null);
  }

  return { status, progress, generatedUrl, createMemoryVideo, reset };
};