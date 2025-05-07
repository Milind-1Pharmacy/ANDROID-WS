export const mimeFromBase64 = (base64: string): string => {
  const mimeTypeRegex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/;

  return (base64.match(mimeTypeRegex) || [])[1];
};

export const extensionFromBase64 = (base64: string): string => {
  const fileExtensionRegex = /^data:[a-zA-Z0-9]+\/([a-zA-Z0-9-.+]+).*,/;

  return (base64.match(fileExtensionRegex) || [])[1];
};

export const getInitials = (name?: string | null): string => {
  // Handle null/undefined/empty cases first
  if (!name || name.trim().length === 0) {
    return 'Guest';
  }

  const nameSplit = name.trim().split(' ');
  const wordCount = nameSplit.length;

  // Handle single word names
  if (wordCount === 1) {
    const firstChar = nameSplit[0][0]?.toUpperCase() || '';
    return firstChar + firstChar;
  }

  // Handle multiple word names

  // Fallback
  return 'G';
};
