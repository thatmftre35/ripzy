const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.jing.rocks',
  'https://vid.puffyan.us',
  'https://invidious.privacyredirect.com',
];
const COBALT_API = 'https://api.cobalt.tools';

interface InvidiousResult {
  type: string;
  videoId: string;
  title: string;
}

interface CobaltResult {
  status: string;
  url?: string;
  error?: { code?: string };
}

async function searchYouTube(query: string): Promise<string> {
  let lastError = '';

  for (const api of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${api}/api/v1/search?q=${encodeURIComponent(query)}&type=video`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!res.ok) {
        lastError = `${api} returned ${res.status}`;
        continue;
      }
      const data = (await res.json()) as InvidiousResult[];
      const video = data.find((i) => i.type === 'video');
      if (!video) {
        lastError = `${api} returned no results`;
        continue;
      }
      console.log(`Found: ${video.title} (${video.videoId}) via ${api}`);
      return `https://www.youtube.com/watch?v=${video.videoId}`;
    } catch (err) {
      lastError = `${api} failed: ${err instanceof Error ? err.message : 'unknown'}`;
      continue;
    }
  }

  throw new Error(`YouTube search failed on all instances: ${lastError}`);
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
