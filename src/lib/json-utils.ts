/**
 * Safely parse JSON string with fallback to empty array
 */
export function safeParseImageUrls(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  
  try {
    // Remove any whitespace
    const trimmed = jsonString.trim();
    
    // Check if it's empty or just whitespace
    if (!trimmed) return [];
    
    // If it starts with [, try to parse as JSON array
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(url => typeof url === 'string' && url.trim()) : [];
    }
    
    // If it starts with http, treat as single URL
    if (trimmed.startsWith('http')) {
      return [trimmed];
    }
    
    // If it looks like a comma-separated list
    if (trimmed.includes(',') && !trimmed.startsWith('{')) {
      return trimmed.split(',').map(url => url.trim()).filter(url => url && url.startsWith('http'));
    }
    
    // Try parsing as JSON anyway (might be malformed but parseable)
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter(url => typeof url === 'string' && url.trim());
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to parse image URLs:', error);
    
    // Last resort: if it contains http, try to extract URLs manually
    if (jsonString.includes('http')) {
      const urls = jsonString.match(/https?:\/\/[^\s",\]]+/g);
      return urls ? urls.filter(url => url.trim()) : [];
    }
    
    return [];
  }
}

/**
 * Safely stringify image URLs array
 */
export function safeStringifyImageUrls(urls: string[] | null | undefined): string | null {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return null;
  }
  
  try {
    // Filter out invalid URLs
    const validUrls = urls.filter(url => 
      typeof url === 'string' && 
      url.trim() && 
      (url.startsWith('http') || url.startsWith('/'))
    );
    
    return validUrls.length > 0 ? JSON.stringify(validUrls) : null;
  } catch (error) {
    console.warn('Failed to stringify image URLs:', error);
    return null;
  }
}