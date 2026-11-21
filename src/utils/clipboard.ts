/**
 * Robust cross-browser & iframe-safe clipboard copy helper.
 * Works seamlessly in sandboxed iframes (e.g. AI Studio preview), HTTP/HTTPS, and all modern mobile/desktop browsers.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Method 1: Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
    }
  }

  // Method 2: Robust legacy document.execCommand('copy') fallback for iframes
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make invisible but selectable
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    
    // Select text specifically for iOS/Android & Desktop
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback execCommand failed:', err);
    return false;
  }
}
