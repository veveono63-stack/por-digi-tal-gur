/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a date string into dd-mm-yyyy format.
 * If the input matches a date format, it converts it. Otherwise, it returns the input as-is.
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  
  const clean = dateStr.trim();
  
  // 1. Check for standard yyyy-mm-dd format (e.g. "2024-06-26")
  const ymdRegex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = clean.match(ymdRegex);
  if (match) {
    const [_, year, month, day] = match;
    return `${day}-${month}-${year}`;
  }
  
  // 2. Try parsing as a Date object if it has a length that suggests a date format
  try {
    if (clean.length > 5 && !/^\d{4}$/.test(clean)) {
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const year = parsed.getFullYear();
        return `${day}-${month}-${year}`;
      }
    }
  } catch (e) {
    // Ignore and fallback
  }
  
  // 3. Fallback to original string if not convertible
  return clean;
}

/**
 * Parses and transforms URLs (especially Google Drive, YouTube, images, and PDFs)
 * for safe and elegant responsive embedding in an iframe or an image.
 */
export function getEmbedUrl(url: string | undefined | null): { 
  type: 'image' | 'pdf' | 'iframe' | 'generic'; 
  embedUrl: string; 
} {
  if (!url) return { type: 'generic', embedUrl: '' };
  
  const cleanUrl = url.trim();
  
  // 1. Direct Image check (or direct data URL)
  if (
    /\.(jpg|jpeg|png|gif|webp|svg)/i.test(cleanUrl) || 
    cleanUrl.includes("images.unsplash.com") || 
    cleanUrl.includes("drive.google.com/uc") || 
    cleanUrl.startsWith("data:image/")
  ) {
    return { type: 'image', embedUrl: cleanUrl };
  }
  
  // 2. PDF URL check
  if (/\.pdf/i.test(cleanUrl)) {
    return { type: 'pdf', embedUrl: cleanUrl };
  }
  
  // 3. Google Drive view link check
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return { type: 'iframe', embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const driveIdMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (cleanUrl.includes("drive.google.com") && driveIdMatch && driveIdMatch[1]) {
    return { type: 'iframe', embedUrl: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview` };
  }

  // 4. Fallback Google Docs PDF Viewer for files that might not be directly viewable but are online
  if (
    cleanUrl.endsWith('.pdf') || 
    cleanUrl.endsWith('.doc') || 
    cleanUrl.endsWith('.docx') || 
    cleanUrl.endsWith('.ppt') || 
    cleanUrl.endsWith('.pptx')
  ) {
    return { type: 'iframe', embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true` };
  }
  
  // 5. YouTube Embed check
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: 'iframe', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // 6. Generic external link fallback
  return { type: 'generic', embedUrl: cleanUrl };
}
