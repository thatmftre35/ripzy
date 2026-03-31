const PIPED_API = 'https://pipedapi.kavin.rocks';
const COBALT_API = 'https://api.cobalt.tools';

interface PipedResult {
  items?: Array<{ type: string; url: string }>;
}

interface CobaltResult {
  status: string;
  url?: string;
  error?: { code?: string };
}

async function searchYouTube(query: string): Promise<string> {
  const res = await fetch(`${PIPED_API}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
  if (!res.ok) {
    throw new Error(`YouTube search failed: ${res.status}`);
  }
  const data = (await res.json()) as PipedResult;
  const items = data.items?.filter((i) => i.type === 'stream');
  if (!items || items.length === 0) {
    throw new Error('No results found');
  }
  return `https://www.youtube.com${items[0].url}`;
}

export async function convertToMp3(title: string, artist: string): Promise<Buffer> {
  const query = `${title} ${artist}`;
  const videoUrl = await searchYouTube(query);

  const cobaltRes = await fetch(COBALT_API, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: videoUrl,
      downloadMode: 'audio',
      audioFormat: 'mp3',
      audioBitrate: '128',
    }),
  });

  if (!cobaltRes.ok) {
    const text = await cobaltRes.text();
    throw new Error(`Cobalt API error: ${cobaltRes.status} ${text}`);
  }

  const cobaltData = (await cobaltRes.json()) as CobaltResult;

  if (cobaltData.status === 'error') {
    throw new Error(`Cobalt error: ${cobaltData.error?.code || 'unknown'}`);
  }

  if (cobaltData.status !== 'tunnel' && cobaltData.status !== 'redirect') {
    throw new Error(`Unexpected Cobalt response: ${cobaltData.status}`);
  }

  if (!cobaltData.url) {
    throw new Error('No download URL returned from Cobalt');
  }

  const audioRes = await fetch(cobaltData.url);
  if (!audioRes.ok) {
    throw new Error(`Failed to download audio: ${audioRes.status}`);
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error('Downloaded audio is empty');
  }

  return buffer;
}
