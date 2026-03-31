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
    const stream = await convertToMp3(title as string, artist as string);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="track.mp3"`);

    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Conversion failed' });
      }
    });
  } catch (err) {
    console.error('Download error:', err);
    const message = err instanceof Error ? err.message : 'Download failed';
    res.status(500).json({ error: message });
  }
});
