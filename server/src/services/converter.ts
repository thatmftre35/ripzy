import { spawn } from 'child_process';

export function convertToMp3(title: string, artist: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const query = `${title} ${artist} audio`;

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

    const chunks: Buffer[] = [];
    let errorOutput = '';

    ffmpeg.stdout.on('data', (chunk) => {
      chunks.push(chunk);
    });

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

    ffmpeg.on('close', (code) => {
      const buffer = Buffer.concat(chunks);
      if (code !== 0 || buffer.length === 0) {
        reject(new Error(`Conversion failed (code ${code}): ${errorOutput || 'empty output'}`));
      } else {
        resolve(buffer);
      }
    });
  });
}
