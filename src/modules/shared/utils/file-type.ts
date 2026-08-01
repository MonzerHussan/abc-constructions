// Pure file-type detection by magic bytes (no framework imports).
// Used by the upload route and security regression tests.

const MAGIC_SIGNATURES: { ext: string; mime: string; bytes: (buf: Buffer) => boolean }[] = [
  {
    ext: 'jpg',
    mime: 'image/jpeg',
    bytes: (b) => b.length > 2 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    mime: 'image/png',
    bytes: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    bytes: (b) =>
      b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
  {
    ext: 'pdf',
    mime: 'application/pdf',
    bytes: (b) => b.length > 4 && b.toString('ascii', 0, 5) === '%PDF-',
  },
];

export function detectType(buffer: Buffer): { ext: string; mime: string } | null {
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes(buffer)) return { ext: sig.ext, mime: sig.mime }
  }
  return null
}
