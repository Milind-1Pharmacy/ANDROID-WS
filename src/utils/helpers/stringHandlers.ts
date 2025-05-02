export const mimeFromBase64 = (base64: string): string => {
  const mimeTypeRegex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/;

  return (base64.match(mimeTypeRegex) || [])[1];
};

export const extensionFromBase64 = (base64: string): string => {
  const fileExtensionRegex = /^data:[a-zA-Z0-9]+\/([a-zA-Z0-9-.+]+).*,/;

  return (base64.match(fileExtensionRegex) || [])[1];
};

export const getInitials = (name: string): string => {
  const nameSplit = name.split(' ');

  const wordCount = nameSplit.length;

  if (wordCount > 1) {
    return nameSplit[0][0] + nameSplit[wordCount - 1][0];
  } else if (wordCount === 1) {
    return nameSplit[0][0] + nameSplit[0][0];
  }

  return '--';
};
