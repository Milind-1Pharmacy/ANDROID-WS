import {config} from '@APIConfig';

const APIURLCollection: {[key: string]: string} = {
  GET_CONFIG: 'config',
  GENERATE_LOGIN_OTP: 'otp',
  USER_LOGIN: 'login',
  USER_DETAIL: 'user_detail',
  GET_DASHBOARD: 'dashboard',
  SEARCH_PRODUCT: 'search_product',
  PRODUCT_DETAILS: 'product',
  PRODUCTS_LISTING: 'product',
  USER_LOCATION: 'location',
  PLACE_ORDER: 'order',
  ORDER_TRACK: 'order_track',
  ORDER_LISTING: 'order',
  SEARCH_LOCATION: 'search_location',
  SUPPORT: 'support',
  UPLOAD_URL: 'upload_url',
  PRESCRIPTION: 'prescription',
  GET_ADDRESS: 'get_address',
  STORE_RETAILER: 'store_retailer',
  B2B_ORDER: 'b2b_order',
  CATEGORY: 'category',
  BRAND: 'brand',
};

export type GetURLOptions = {
  key: keyof typeof APIURLCollection;
  pathParams?: string | number | null;
  queryParams?: {[key: string]: string | number | null};
};

export const getURL = (options: GetURLOptions): string => {
  const {key, pathParams, queryParams} = options;
  const basePath = APIURLCollection[key];

  const pathWithParams = basePath + (pathParams ? `/${pathParams}` : '');

  const queryKeys = Object.keys(queryParams || {});

  const pathWithQuery =
    pathWithParams +
    (queryKeys.length > 0
      ? '?' +
        queryKeys
          .map(queryKey => `${queryKey}=${(queryParams || {})[queryKey]}`)
          .join('&')
      : '');

  return config.baseURL + pathWithQuery;
};

export default APIURLCollection;
