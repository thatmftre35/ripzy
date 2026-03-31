import { Router } from 'express';
import { convertToMp3 } from '../services/converter';

export const downloadRouter = Router();

downloadRouter.get('/download', async (req, res) => {
  const { title, artist } = req.query;

  if (!title || !artist) {
    res.status(400).json({ error: 'title and artist are required' });
    return;
  }

  try {
    const buffer = await convertToMp3(title as string, artist as string);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="track.mp3"`);
    res.send(buffer);
  } catch (err) {
    console.error('Download error:', err);
    const message = err instanceof Error ? err.message : 'Download failed';
    res.status(500).json({ error: message });
  }
});
