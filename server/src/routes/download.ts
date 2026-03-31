import { Router } from 'express';
import { convertToMp3 } from '../services/converter';

export const downloadRouter = Router();

downloadRouter.get('/download', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    res.status(400).json({ error: 'videoId is required' });
    return;
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const buffer = await convertToMp3(videoUrl);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="track.mp3"');
    res.send(buffer);
  } catch (err) {
    console.error('Download error:', err);
    const message = err instanceof Error ? err.message : 'Download failed';
    res.status(500).json({ error: message });
  }
});
