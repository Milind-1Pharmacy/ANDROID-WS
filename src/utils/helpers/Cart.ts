import {UserRoleAlias} from '../Constants/UserRoles';

const fallbackCartTotalCalculator = (cartItems: any) => {
  return cartItems.reduce((acc: number, item: any) => {
    return acc + item.price * item.qty;
  }, 0);
};

const retailCartTotalCalculator = (cartItems: any) => {
  return cartItems.reduce((acc: number, item: any) => {
    return acc + (item.ptr || item.price) * item.qty;
  }, 0);
};

export const placeOrderAPIKey = {
  [UserRoleAlias.CUSTOMER]: 'PLACE_ORDER',
  [UserRoleAlias.B2C_SALESMAN]: 'PLACE_ORDER',
  [UserRoleAlias.RETAILER]: 'B2B_ORDER',
  [UserRoleAlias.SALESMAN]: 'B2B_ORDER',
};

const fallbackCartBodyProcessor = (cart: any) => ({
  items: cart.items?.map((item: any) => ({
    id: item.id,
    qty: item.qty,
  })),
  locationId: cart.locationId,
  shippingType: cart.shippingType,
  imageUrl: cart.imageUrl,
  prescriptionIds: cart.prescriptionIds,
});

const itemPriceKeys: {[key: string]: string} = {
  [UserRoleAlias.CUSTOMER]: 'price',
  [UserRoleAlias.B2C_SALESMAN]: 'price',
  [UserRoleAlias.RETAILER]: 'ptr',
  [UserRoleAlias.SALESMAN]: 'ptr',
};

const cartBodyProcessors: {[key: string]: Function} = {
  [UserRoleAlias.CUSTOMER]: fallbackCartBodyProcessor,
  [UserRoleAlias.B2C_SALESMAN]: fallbackCartBodyProcessor,
  [UserRoleAlias.RETAILER]: (cart: any) => ({
    items: cart.items?.map((item: any) => ({
      id: item.id,
      qty: item.qty,
    })),
  }),
  [UserRoleAlias.SALESMAN]: (cart: any) => ({
    items: cart.items?.map((item: any) => ({
      id: item.id,
      qty: item.qty,
    })),
    retailerId: cart.retailerId,
  }),
};

export const getCartBodyProcessor = (appMode: string) =>
  cartBodyProcessors[appMode] || fallbackCartBodyProcessor;

export const getItemPriceKey = (appMode: string) => {
  return itemPriceKeys[appMode] || 'price';
};

const cartTotalCalculators: {[key: string]: Function} = {
  [UserRoleAlias.CUSTOMER]: fallbackCartTotalCalculator,
  [UserRoleAlias.B2C_SALESMAN]: fallbackCartTotalCalculator,
  [UserRoleAlias.RETAILER]: retailCartTotalCalculator,
  [UserRoleAlias.SALESMAN]: retailCartTotalCalculator,
};

export const getCartTotalCalculator = (appMode: string) => {
  return cartTotalCalculators[appMode] || fallbackCartTotalCalculator;
};
