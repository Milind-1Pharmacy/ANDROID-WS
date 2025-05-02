/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, {
  useRef,
  useEffect,
  useContext,
  useCallback,
  memo,
  useState,
  useMemo,
} from 'react';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {
  APIContext,
  APIContextProvider,
  AuthContext,
  AuthContextProvider,
  FormStateContext,
  FormStateProvider,
  PickupModeProvider,
  ToastContext,
  ToastProvider,
  useIsPickupMode,
} from '@contextProviders';
import {NativeBaseProvider, View, extendTheme} from 'native-base';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faAdd,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faArrowLeft,
  faArrowUpFromBracket,
  faBars,
  faCamera,
  faCapsules,
  faCartShopping,
  faCheck,
  faChevronRight,
  faChevronUp,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faEnvelope,
  faFileInvoiceDollar,
  faFilePrescription,
  faFilter,
  faHospital,
  faHourglassHalf,
  faHouseChimney,
  faHouseMedical,
  faImages,
  faIndianRupeeSign,
  faLocationCrosshairs,
  faLocationDot,
  faMagnifyingGlass,
  faPen,
  faPenToSquare,
  faPercent,
  faPhone,
  faPills,
  faPrescription,
  faPrescriptionBottle,
  faPrescriptionBottleMedical,
  faQrcode,
  faRightFromBracket,
  faRightToBracket,
  faShop,
  faSitemap,
  faStethoscope,
  faSubtract,
  faSyringe,
  faTablet,
  faTrashAlt,
  faTriangleExclamation,
  faUser,
  faXmark,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import {faWhatsapp} from '@fortawesome/free-brands-svg-icons';
import {generateMedBackground} from '@assets';
import SideDrawer from './src/components/SideDrawer';
import {LoadingScreen} from '@commonComponents';
import {APIGet} from '@APIHandler';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import {
  extractStoreAndMode,
  loadStoreInfo,
  navigationStorage,
  parseError,
  saveStoreInfo,
} from '@helpers';
import {
  Home,
  LoginScreen,
  VerifyOTP,
  ItemDetails,
  CartScreen,
  OrderDetailsScreen,
  OrdersListing,
  AddressListScreen,
  SupportScreen,
  SearchAddress,
  SelectLocation,
  AddressForm,
  PrescriptionOrder,
} from './src/components/screens/index';
import DynamicGridScreen from '@screens/DynamicGridScreen';

import {suspensify} from '@Lazy';
import {debounce} from 'lodash';
import {useContextSelector} from 'use-context-selector';
import SearchScreen from '@screens/SearchScreen';
import ItemsListing from '@screens/ItemsListing';
import { Linking } from 'react-native';

library.add(
  faPills,
  faFileInvoiceDollar,
  faShop,
  faCartShopping,
  faQrcode,
  faBars,
  faPhone,
  faWhatsapp,
  faFilter,
  faTrashAlt,
  faAngleDoubleUp,
  faAngleDoubleDown,
  faPen,
  faCircleXmark,
  faAdd,
  faSubtract,
  faChevronRight,
  faPercent,
  faIndianRupeeSign,
  faCheck,
  faRightFromBracket,
  faRightToBracket,
  faStethoscope,
  faHospital,
  faTablet,
  faSyringe,
  faPrescriptionBottleMedical,
  faPrescriptionBottle,
  faPrescription,
  faHouseMedical,
  faHouseChimney,
  faFilePrescription,
  faCapsules,
  faSitemap,
  faCircleExclamation,
  faXmark,
  faPenToSquare,
  faArrowUpFromBracket,
  faCircleInfo,
  faUser,
  faMagnifyingGlass,
  faArrowLeft,
  faLocationDot,
  faTriangleExclamation,
  faEnvelope,
  faLocationCrosshairs,
  faCamera,
  faImages,
  faChevronUp,
  faHourglassHalf,
  faCircleCheck,
);

generateMedBackground();

const _1PTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    primaryText: '#0000FF',
  },
};

const _1PNativeBaseTheme = extendTheme({
  colors: {
    text: {
      900: '#3C3C3C',
    },
  },
});

export type RootStackParamList = {
  Home: {initialTab: string} | undefined;
  Login: undefined;
  VerifyOTP: {phone: number | string};
  ItemsListing: {listBy: string; type: string};
  DynamicGridScreen: {listByType: string};
  ItemDetails: {itemId: string};
  Search: {searchItem: string} | undefined;
  Cart: undefined;
  PrescriptionOrder: undefined;
  OrdersListing: undefined;
  OrderDetails: {orderId: string};
  AddressListing: undefined;
  SearchAddress: undefined;
  SelectLocation: undefined;
  AddressForm: undefined;
  Support: undefined;
};

const linking = {
  prefixes: ['onepharmacy://'],
  config: {
    screens: {
      Home: 'home',
      Login: 'login',
      VerifyOTP: 'verifyOTP',
      ItemsListing: 'items',
      DynamicGridScreen: 'listing',
      ItemDetails: 'item',
      Search: 'search/:searchItem',
      Cart: 'cart',
      PrescriptionOrder: 'prescription_order',
      OrdersListing: 'orders',
      OrderDetails: 'order/:orderId',
      AddressListing: 'my_addresses',
      SearchAddress: 'search_address',
      SelectLocation: 'select_location',
      AddressForm: 'address_details',
      Support: 'support',
    },
  },
};

type RouteDefinition = {
  name: keyof RootStackParamList;
  component:
    | React.FC<NativeStackScreenProps<RootStackParamList, 'Home'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'Login'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'ItemsListing'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'DynamicGridScreen'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'ItemDetails'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'Search'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'Cart'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'PrescriptionOrder'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'OrdersListing'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'OrderDetails'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'AddressListing'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'SearchAddress'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'SelectLocation'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'AddressForm'>>
    | React.FC<NativeStackScreenProps<RootStackParamList, 'Support'>>
    | undefined;
};

const AppNavigator = (props: any) => {
  const storeIdRef = useRef(props.route?.params?.storeId);
  const [configFetchAttempted, setConfigFetchAttempted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const {showToast} = useContext(ToastContext);
  const {cart = {items: []}} = useContextSelector(FormStateContext, state => ({
    cart: state.cart || {items: []},
  }));
  const {statusCode} = useContext(APIContext);
  const {
    authStatus,
    storeId: localStoreId,
    setStoreId,
    setStoreConfig,
  } = useContext(AuthContext);
  const isPickupMode = useIsPickupMode();

  const routes = useMemo<RouteDefinition[]>(
    () => [
      {name: 'Login', component: LoginScreen},
      {name: 'VerifyOTP', component: VerifyOTP},
      {name: 'ItemsListing', component: suspensify(React.lazy(() => import('@screens/ItemsListing')))},
      {name: 'DynamicGridScreen', component: DynamicGridScreen},
      {name: 'ItemDetails', component: ItemDetails},
      {name: 'Search', component: suspensify(React.lazy(() => import('@screens/SearchScreen')))},
      {name: 'Cart', component: CartScreen},
      {name: 'PrescriptionOrder', component: PrescriptionOrder},
      {name: 'OrdersListing', component: OrdersListing},
      {name: 'OrderDetails', component: OrderDetailsScreen},
      ...(isPickupMode
        ? []
        : [
            {
              name: 'AddressListing',
              component: AddressListScreen,
            } as RouteDefinition,
          ]),
      {name: 'SearchAddress', component: SearchAddress},
      {name: 'SelectLocation', component: SelectLocation},
      {name: 'AddressForm', component: AddressForm},
      {name: 'Support', component: SupportScreen},
    ],
    [isPickupMode],
  );

  const fetchConfig = useCallback(
    (effectiveStoreId: string | null | undefined) => {
      if (
        (authStatus.loggedIn || !!effectiveStoreId) &&
        !configFetchAttempted
      ) {
        setConfigFetchAttempted(true);
        APIGet({
          url: getURL({
            key: 'GET_CONFIG',
            pathParams: effectiveStoreId,
          }),
          resolve: (response: any) => {
            setStoreConfig(response.data);
          },
          reject: (error: any) => {
            showToast({
              ...ToastProfiles.error,
              title: parseError(error).message || 'Unable to fetch config',
              id: 'config-fetch-error',
            });
            setLoaded(true);
          },
        });
      } else {
        setLoaded(true);
      }
    },
    [authStatus.loggedIn, setStoreConfig, showToast, configFetchAttempted],
  );

  React.useEffect(() => {
    const effectiveStoreId =
      storeIdRef.current || props.storeIdFromUrl || localStoreId;
    setStoreId(effectiveStoreId !== '' ? effectiveStoreId : 'urmedz');
    fetchConfig(effectiveStoreId);
  }, [props.storeIdFromUrl, fetchConfig, setStoreId, localStoreId]);

  // Redirect the user to the Login screen if the status code is 401 or 1001.
  useEffect(() => {
    if (statusCode && (statusCode === 401 || statusCode === 1001)) {
      props.navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  }, [statusCode, props.navigation]);

  return loaded ? (
    <View style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={authStatus.loggedIn ? 'Home' : 'Login'}>
        {routes.map((route: any) => (
          <Stack.Screen
            key={route.name}
            name={route.name as keyof RootStackParamList}
            component={
              route.component as React.FC<
                NativeStackScreenProps<RootStackParamList, typeof route.name>
              >
            }
          />
        ))}
      </Stack.Navigator>
    </View>
  ) : (
    <LoadingScreen />
  );
};

type StoreInfo = {
  storeId: string | null;
  isPickupMode: boolean;
  modeParam?: string | null;
};

const NavigationContent = (props: any) => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();
  const previousRouteNameRef = useRef<string>();
  const previousRoutePathParams = useRef<any | undefined>();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const isRestoringRef = useRef(false);
  const MemoizedSideDrawer = memo(SideDrawer);
  const MemoizedAppNavigator = memo(AppNavigator);
  const [localStoreInfo, setLocalStoreInfo] = useState<StoreInfo>({
    storeId: null,
    isPickupMode: false,
    modeParam: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [modeCheckPerformed, setModeCheckPerformed] = useState(false);

  useEffect(() => {
    const initializeStoreInfo = async () => {
      try {
        if (!modeCheckPerformed) {
          const url = await Linking.getInitialURL();

          if (url) {
            const extractedInfo = extractStoreAndMode(url);
            if (extractedInfo.storeId) {
              await saveStoreInfo(
                extractedInfo.storeId ?? '',
                extractedInfo.isPickupMode ?? false,
                extractedInfo.modeParam ?? '',
              );

              setLocalStoreInfo(extractedInfo);
              setIsInitialized(true);
              setModeCheckPerformed(true);
              return;
            }
          }
        }

        const savedInfo = await loadStoreInfo();
        setLocalStoreInfo(savedInfo);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing store info:', error);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeStoreInfo();
    }
  }, [isInitialized, modeCheckPerformed]);

  const debouncedSaveState = useCallback(
    debounce(state => {
      if (!isRestoringRef.current) {
        navigationStorage.saveState(state);
      }
    }, 800),
    [],
  );

  useEffect(() => {
    let mounted = true;

    const restoreState = async () => {
      if (!mounted) return;

      try {
        isRestoringRef.current = true;
        const state = await navigationStorage.loadState();
        if (mounted && state) {
          setInitialState(state);
        }
      } catch (err) {
        console.warn('State restoration failed:', err);
      } finally {
        if (mounted) {
          setIsReady(true);
          isRestoringRef.current = false;
        }
      }
    };

    if (!isReady) {
      restoreState();
    }

    return () => {
      mounted = false;
      debouncedSaveState.cancel();
    };
  }, [isReady, debouncedSaveState]);

  const onStateChange = useCallback(
    (state: any) => {
      const currentRoute = navigationRef.current?.getCurrentRoute();
      const currentRouteName = currentRoute?.name;
      routeNameRef.current = currentRouteName;
      const currentPathParams = currentRoute?.params;
      if (
        currentRouteName !== previousRouteNameRef.current ||
        (currentPathParams && 'itemId' in currentPathParams) !==
          'itemId' in previousRoutePathParams
      ) {
        debouncedSaveState(state);
        previousRouteNameRef.current = currentRouteName;
      }
    },
    [debouncedSaveState, navigationRef],
  );

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      theme={_1PTheme}
      linking={linking}
      ref={navigationRef}
      initialState={initialState}
      onStateChange={onStateChange}
      fallback={<LoadingScreen />}>
      <MemoizedSideDrawer
        component={MemoizedAppNavigator}
        // storeIdFromUrl={localStoreInfo.storeId}
        // isPickupMode={localStoreInfo.isPickupMode}
      />
    </NavigationContainer>
  );
};

const AppContent = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialization logic if needed
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PickupModeProvider>
      <FormStateProvider>
        <NavigationContent />
      </FormStateProvider>
    </PickupModeProvider>
  );
};

function App(): JSX.Element {
  return (
    <NativeBaseProvider theme={_1PNativeBaseTheme}>
      <ToastProvider>
        <AuthContextProvider>
          <APIContextProvider>
            <AppContent />
          </APIContextProvider>
        </AuthContextProvider>
      </ToastProvider>
    </NativeBaseProvider>
  );
}

export default App;
