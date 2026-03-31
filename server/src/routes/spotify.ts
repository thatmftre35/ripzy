import { Router } from 'express';
import { getPlaylistData } from '../services/spotify';

export const spotifyRouter = Router();

spotifyRouter.get('/playlist/:id', async (req, res) => {
  try {
    const data = await getPlaylistData(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('Spotify error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch playlist';
    res.status(500).json({ error: message });
  }
});
