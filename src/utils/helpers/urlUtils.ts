const predefinedRoutes = new Set([
  'home',
  'dashboard',
  'search',
  'cart',
  'login',
  'verifyOTP',
  'items',
  'listing',
  'item',
  'prescription_order',
  'orders',
  'order',
  'my_addresses',
  'search_address',
  'select_location',
  'address_details',
  'support',
]);

export const extractStoreAndMode = (
  url: string,
): {
  storeId: string | null;
  isPickupMode: boolean;
  modeParam: string | null;
} => {
  try {
    // First decode the URL completely
    const decodedUrl = decodeURIComponent(url);

    // Clean up multiple query parameter markers
    const cleanedUrl = decodedUrl
      .replace(/([?&]initialTab=[^&]*)+/g, '') // Remove duplicate initialTab params
      .replace(/%3F/g, '?') // Replace all %3F with ?
      .replace(/%3D/g, '=') // Replace all %3D with =
      .replace(/\?+/g, '?') // Replace multiple ? with single ?
      .replace(/&+/g, '&') // Replace multiple & with single &
      .replace(/\?&/, '?') // Fix ?& sequences
      .replace(/&$/, ''); // Remove trailing &

    // Create URL object (add protocol if missing)
    const urlWithProtocol = cleanedUrl.startsWith('http')
      ? cleanedUrl
      : `https://${cleanedUrl}`;
    const urlObj = new URL(urlWithProtocol);

    // Extract path segments
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const storeIdCandidate = pathSegments[0] || null;

    // Check if it's a predefined route
    if (!storeIdCandidate || predefinedRoutes.has(storeIdCandidate)) {
      return {storeId: null, isPickupMode: false, modeParam: null};
    }

    // Simplified mode check - just get the first mode parameter
    const modeParam = urlObj.searchParams.get('mode');
    const isPickupMode = modeParam?.toLowerCase() === 'pickup';

    return {
      storeId: storeIdCandidate,
      isPickupMode,
      modeParam,
    };
  } catch (error) {
    console.error('URL parsing error:', error);
    return {storeId: null, isPickupMode: false, modeParam: null};
  }
};
