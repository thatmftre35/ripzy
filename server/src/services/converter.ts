const COBALT_API = process.env.COBALT_API_URL || 'http://localhost:9000';

interface CobaltResult {
  status: string;
  url?: string;
  error?: { code?: string };
}

export async function convertToMp3(videoUrl: string): Promise<Buffer> {
  const res = await fetch(COBALT_API, {
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cobalt error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as CobaltResult;

  if (data.status === 'error') {
    throw new Error(`Cobalt: ${data.error?.code || 'unknown error'}`);
  }

  if (!data.url) {
    throw new Error(`Cobalt: no download URL (status: ${data.status})`);
  }

  const audioRes = await fetch(data.url);
  if (!audioRes.ok) {
    throw new Error(`Audio download failed: ${audioRes.status}`);
  }

  const buffer = Buffer.from(await audioRes.arrayBuffer());
  if (buffer.length === 0) {
    throw new Error('Downloaded audio is empty');
  }

  return buffer;
}
