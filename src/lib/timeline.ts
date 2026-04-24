import type { ArchiveCapture } from './supabase';

export function screenshotUrl(capture: ArchiveCapture): string | null {
  return capture.custom_screenshot_url || null;
}

export function sortCaptures(captures: ArchiveCapture[]): ArchiveCapture[] {
  return [...captures].sort((a, b) => a.year - b.year);
}
