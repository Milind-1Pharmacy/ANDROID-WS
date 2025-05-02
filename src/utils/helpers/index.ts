import {fireDeeplink} from './AppLinking';
import {
  getCartBodyProcessor,
  getCartTotalCalculator,
  getItemPriceKey,
  placeOrderAPIKey,
} from './Cart';
import {opacityToHex} from './colors';
import {
  extensionFromBase64,
  getInitials,
  mimeFromBase64,
} from './stringHandlers';
import {parseError} from './ParseError';
import {extractStoreAndMode} from './urlUtils';
import {navigationStorage} from './navigationStorage';
import {loadStoreInfo, saveStoreInfo} from './storeInfoStorage';
import {validateNavigationState} from './validateNavigationState';

export {
  opacityToHex,
  mimeFromBase64,
  extensionFromBase64,
  fireDeeplink,
  getItemPriceKey,
  getCartTotalCalculator,
  getCartBodyProcessor,
  placeOrderAPIKey,
  getInitials,
  parseError,
  extractStoreAndMode,
  navigationStorage,
  loadStoreInfo,
  saveStoreInfo,
  validateNavigationState,
};
