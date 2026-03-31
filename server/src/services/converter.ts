import { spawn } from 'child_process';
import { Readable } from 'stream';

export function convertToMp3(title: string, artist: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    const query = `${title} ${artist} audio`;

    // yt-dlp searches YouTube, extracts audio, pipes to ffmpeg for MP3 conversion
    const ytdlp = spawn('yt-dlp', [
      `ytsearch1:${query}`,
      '--no-playlist',
      '-f', 'bestaudio',
      '-o', '-',
      '--quiet',
      '--no-warnings',
    ]);

    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'mp3',
      '-ab', '192k',
      '-vn',
      '-loglevel', 'error',
      'pipe:1',
    ]);

    ytdlp.stdout.pipe(ffmpeg.stdin);

    let errorOutput = '';

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on('error', (err) => {
      reject(new Error(`yt-dlp not found: ${err.message}`));
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found: ${err.message}`));
    });

    ytdlp.on('close', (code) => {
      if (code !== 0 && code !== null) {
        // Don't reject here - ffmpeg might still be processing
      }
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Conversion failed: ${errorOutput}`));
      }
    });

    // Resolve with the ffmpeg output stream immediately
    resolve(ffmpeg.stdout);
  });
}
