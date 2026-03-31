const INNERTUBE_API = 'https://www.youtube.com/youtubei/v1';
const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

export async function searchYouTube(query: string): Promise<string> {
  const res = await fetch(
    `${INNERTUBE_API}/search?key=${INNERTUBE_KEY}&prettyPrint=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US',
          },
        },
        query,
      }),
    }
  );

  if (!res.ok) throw new Error(`YouTube search failed: ${res.status}`);
  const text = await res.text();

  const matches = text.match(/"videoId":"([A-Za-z0-9_-]{11})"/g);
  if (!matches || matches.length === 0) {
    throw new Error('No video found');
  }

  // Return first unique video ID
  const seen = new Set<string>();
  for (const match of matches) {
    const id = match.slice(11, -1);
    if (!seen.has(id)) return id;
  }

  throw new Error('No video found');
}
