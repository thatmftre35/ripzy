import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { spotifyRouter } from './routes/spotify';
import { downloadRouter } from './routes/download';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/spotify', spotifyRouter);
app.use('/api', downloadRouter);

app.listen(PORT, () => {
  console.log(`Ripzy server running on port ${PORT}`);
});
