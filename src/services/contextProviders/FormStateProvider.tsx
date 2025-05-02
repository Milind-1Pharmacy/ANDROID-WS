import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {AuthContext} from './AuthContextProvider';
import {isEqual} from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCartTotalCalculator} from '@helpers';
import {createContext} from 'use-context-selector';
import {debounce} from 'lodash';

const initialState: {[key: string]: any} = {
  cart: {
    items: [],
    totalAmount: 0,
    locationId: '',
    retailerId: '',
    shippingType: 0,
  },
  prescriptionCart: {
    texts: [],
    locationId: '',
    shippingType: 0,
  },
  location: {
    title: 'Other',
    address: '',
    area: '',
    direction: '',
    house: '',
    lat: 0,
    lng: 0,
  },
  updateCart: (data: any) => {},
  resetCart: () => {},
  updatePrescriptionCart: (data: any) => {},
  resetPrescriptionCart: () => {},
  updateLocation: (data: any) => {},
  resetLocation: () => {},
  addedPrescriptions: [],
  setAddedPrescriptions: () => {},
  resetAddedPrescriptions: () => {},
  addedOVPPrescriptions: [],
  setAddedOVPPrescriptions: () => {},
  resetAddedOVPPrescriptions: () => {},
};

const getInitialCart = (
  cartBase: typeof initialState.cart = initialState.cart,
) => ({
  ...cartBase,
  items: [],
  totalAmount: 0,
  shippingType: 0,
});

const getInitialPrescriptionCart = (
  cartBase: typeof initialState.prescriptionCart = initialState.prescriptionCart,
) => ({
  ...cartBase,
  texts: [],
  totalAmount: 0,
  shippingType: 0,
});

const getInitialLocation = (
  locationBase: typeof initialState.location = initialState.location,
) => locationBase;

export const FormStateContext = createContext(initialState);

const FormStateProvider = (props: {children: React.ReactNode}) => {
  const [cart, setCart] = useState(getInitialCart());
  const [prescriptionCart, setPrescriptionCart] = useState(
    getInitialPrescriptionCart(),
  );
  const [location, setLocation] = useState(getInitialLocation());
  const [addedPrescriptions, setAddedPrescriptions] = useState(
    initialState.addedPrescriptions,
  );
  const [addedOVPPrescriptions, setAddedOVPPrescriptions] = useState(
    initialState.addedOVPPrescriptions,
  );
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  const {authStatus, appMode} = useContext(AuthContext);

  // Memoized cart total calculator
  const cartTotalCalculator = useMemo(
    () => getCartTotalCalculator(appMode as string),
    [appMode],
  );

  // Use a more efficient storage mechanism
  const saveCartToStorage = useCallback(
    async (cartData: any) => {
      try {
        // Use a lightweight serialization
        const serializedCart = JSON.stringify({
          items: cartData.items,
          totalAmount: cartData.totalAmount,
          locationId: cartData.locationId,
          retailerId: cartData.retailerId,
          shippingType: cartData.shippingType ?? 0,
        });

        const cartKey = `cart-${authStatus?.user?.id || 'unauthenticated'}`;

        AsyncStorage.setItem(cartKey, serializedCart);
      } catch (err) {
        console.error('Storage error:', err);
      }
    },
    [authStatus?.user?.id],
  );

  // Reduce debounce time and use leading edge
  const debouncedSaveCart = useMemo(
    () =>
      debounce(saveCartToStorage, 100, {
        leading: true,
        trailing: false,
      }),
    [saveCartToStorage],
  );
  // Update cart with proper state merging
  const updateCart = useCallback(
    (data: Partial<any>) => {
      setCart((prev: any) => {
        const newCart = {...prev, ...data};
        if (data.items) {
          newCart.totalAmount = cartTotalCalculator(data.items);
        }
        return newCart;
      });

      if (isCartLoaded) {
        debouncedSaveCart({...cart, ...data});
      }
    },
    [cart, isCartLoaded, debouncedSaveCart, cartTotalCalculator],
  );

  useEffect(() => {
    return () => {
      debouncedSaveCart.cancel();
    };
  }, [debouncedSaveCart]);

  // Optimized item quantity manipulation
  const manipulateItemQuantity = useCallback(
    (item: any, operation: '+' | '-') => {
      setCart((prev: any) => {
        // Create a copy of the current items
        const currentItems = [...prev.items];
        const itemIndex = currentItems.findIndex(
          (cartItem: any) => cartItem.id === item.id,
        );

        if (operation === '+') {
          if (itemIndex === -1) {
            // Add new item if not exists
            currentItems.push({...item, qty: 1});
          } else {
            // Increment existing item quantity
            currentItems[itemIndex] = {
              ...currentItems[itemIndex],
              qty: currentItems[itemIndex].qty + 1,
            };
          }
        } else if (operation === '-' && itemIndex !== -1) {
          if (currentItems[itemIndex].qty === 1) {
            // Remove item if quantity becomes zero
            currentItems.splice(itemIndex, 1);
          } else {
            // Decrement existing item quantity
            currentItems[itemIndex] = {
              ...currentItems[itemIndex],
              qty: currentItems[itemIndex].qty - 1,
            };
          }
        }

        // Calculate total amount more efficiently
        const totalAmount = cartTotalCalculator(currentItems);

        return {
          ...prev,
          items: currentItems,
          totalAmount,
        };
      });
    },
    [cartTotalCalculator],
  );

  const handleAdd = useCallback(
    (item: any) => manipulateItemQuantity(item, '+'),
    [manipulateItemQuantity],
  );
  const handleSubtract = useCallback(
    (item: any) => manipulateItemQuantity(item, '-'),
    [manipulateItemQuantity],
  );

  const resetCart = useCallback(async () => {
    const initialCart = getInitialCart();
    setCart(initialCart);
    await saveCartToStorage(initialCart);
  }, [saveCartToStorage]);

  const updatePrescriptionCart = useCallback((data: Partial<any>) => {
    setPrescriptionCart((prev: any) => ({...prev, ...data}));
  }, []);

  const resetPrescriptionCart = useCallback(() => {
    setPrescriptionCart(getInitialPrescriptionCart());
  }, []);

  const updateLocation = useCallback((data: Partial<any>) => {
    setLocation((prev: any) => ({...prev, ...data}));
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(getInitialLocation());
  }, []);

  const setAddedPrescriptionsList = useCallback((list: any[]) => {
    setAddedPrescriptions((prev: any) => ({...prev, list, loaded: true}));
  }, []);

  const resetAddedPrescriptionsList = useCallback(() => {
    setAddedPrescriptions({loaded: true, list: []});
  }, []);

  const setAddedOVPPrescriptionsList = useCallback((list: any[]) => {
    setAddedOVPPrescriptions((prev: any) => ({...prev, list, loaded: true}));
  }, []);

  const resetAddedOVPPrescriptionsList = useCallback(() => {
    setAddedOVPPrescriptions({loaded: true, list: []});
  }, []);

  // Merge cart on login
  const mergeCartOnLogin = useCallback(async () => {
    if (authStatus.loggedIn && authStatus.user?.id) {
      try {
        const userCartKey = `cart-${authStatus.user.id}`;
        const unauthCartKey = `cart-unauthenticated`;
        const [userCartData, unauthCartData] = await Promise.all([
          AsyncStorage.getItem(userCartKey),
          AsyncStorage.getItem(unauthCartKey),
        ]);

        if (unauthCartData) {
          const unauthCart = JSON.parse(unauthCartData);
          if (unauthCart?.items?.length > 0) {
            await AsyncStorage.setItem(userCartKey, JSON.stringify(unauthCart));
            setCart(unauthCart);
            await AsyncStorage.removeItem(unauthCartKey);
            setIsCartLoaded(true);
            return true;
          }
        }

        if (userCartData) {
          setCart(JSON.parse(userCartData));
          setIsCartLoaded(true);
          return true;
        }
      } catch (err) {
        console.error('Error merging cart on login:', err);
      }
    }
    return false;
  }, [authStatus.loggedIn, authStatus.user?.id]);

  // Load cart for user
  const loadCartForUser = useCallback(async () => {
    try {
      const cartKey = `cart-${authStatus.user?.id || 'unauthenticated'}`;
      const cartData = await AsyncStorage.getItem(cartKey);
      const parsedCart = cartData ? JSON.parse(cartData) : getInitialCart();
      setCart(parsedCart);
      setIsCartLoaded(true);
    } catch (err) {
      console.error('Error loading cart from AsyncStorage:', err);
      setIsCartLoaded(true);
    }
  }, [authStatus.user?.id]);

  // Handle auth changes and cart loading
  useEffect(() => {
    const loadCart = async () => {
      setIsCartLoaded(false);
      const merged = await mergeCartOnLogin();
      if (!merged) {
        await loadCartForUser();
      }
    };

    loadCart();
  }, [
    authStatus.loggedIn,
    authStatus.user?.id,
    loadCartForUser,
    mergeCartOnLogin,
  ]);

  // Save cart when it changes
  useEffect(() => {
    if (isCartLoaded && !isEqual(cart, getInitialCart())) {
      saveCartToStorage(cart);
    }
  }, [cart, isCartLoaded, saveCartToStorage]);

  // Save prescriptions when they change
  useEffect(() => {
    if (authStatus.loggedIn && addedPrescriptions.loaded) {
      AsyncStorage.setItem(
        `prescriptions-${authStatus.user?.id}`,
        JSON.stringify(addedPrescriptions.list),
      );
    }
  }, [
    addedPrescriptions.list,
    addedPrescriptions.loaded,
    authStatus.loggedIn,
    authStatus.user?.id,
  ]);

  // Save OVP prescriptions when they change
  useEffect(() => {
    if (authStatus.loggedIn && addedOVPPrescriptions.loaded) {
      AsyncStorage.setItem(
        `ovp_prescriptions-${authStatus.user?.id}`,
        JSON.stringify(addedOVPPrescriptions.list),
      );
    }
  }, [
    addedOVPPrescriptions.list,
    addedOVPPrescriptions.loaded,
    authStatus.loggedIn,
    authStatus.user?.id,
  ]);

  // Reset states on logout
  useEffect(() => {
    if (!authStatus.loggedIn) {
      resetCart();
      resetPrescriptionCart();
      resetLocation();
      resetAddedPrescriptionsList();
      resetAddedOVPPrescriptionsList();

      const cartKey = `cart-${authStatus.user?.id || 'unauthenticated'}`;
      AsyncStorage.removeItem(cartKey);
    }
  }, [
    authStatus.loggedIn,
    authStatus.user?.id,
    resetCart,
    resetPrescriptionCart,
    resetLocation,
    resetAddedPrescriptionsList,
    resetAddedOVPPrescriptionsList,
  ]);

  // Update cart total when appMode changes
  useEffect(() => {
    setCart((prev: any) => ({
      ...prev,
      totalAmount: cartTotalCalculator(prev.items),
    }));
  }, [appMode, cartTotalCalculator]);

  return (
    <FormStateContext.Provider
      value={{
        cart,
        prescriptionCart,
        location,
        addedPrescriptions: addedPrescriptions.list,
        addedOVPPrescriptions: addedOVPPrescriptions.list,
        updateCart,
        resetCart,
        updatePrescriptionCart,
        resetPrescriptionCart,
        updateLocation,
        resetLocation,
        setAddedPrescriptions: setAddedPrescriptionsList,
        resetAddedPrescriptions: resetAddedPrescriptionsList,
        setAddedOVPPrescriptions: setAddedOVPPrescriptionsList,
        resetAddedOVPPrescriptions: resetAddedOVPPrescriptionsList,
        handleAdd,
        handleSubtract,
      }}>
      {props.children}
    </FormStateContext.Provider>
  );
};

export default FormStateProvider;
