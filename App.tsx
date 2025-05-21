/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
  DefaultTheme,
  NavigationContainer,
  useNavigation,
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
  Suspense,
} from 'react';
import {
  NativeStackNavigationProp,
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
  usePickupMode,
} from '@contextProviders';
import {
  Button,
  Input,
  NativeBaseProvider,
  View,
  extendTheme,
} from 'native-base';
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

import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
// import {
//   Home,
//   LoginScreen,
//   VerifyOTP,
//   ItemDetails,
//   SearchScreen,
//   CartScreen,
//   OrderDetailsScreen,
//   OrdersListing,
//   AddressListScreen,
//   SupportScreen,
//   SearchAddress,
//   SelectLocation,
//   AddressForm,
//   PrescriptionOrder,
//   ItemsListing,
// } from './src/components/screens/index';

// import DynamicGridScreen from '@screens/DynamicGridScreen';
// import {suspensify} from '@Lazy';
// import {debounce} from 'lodash';
import {useContextSelector} from 'use-context-selector';
import {Alert, Platform} from 'react-native';
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
const SearchAddress = React.lazy(() => import('@screens/SearchAddress'));
const AddressListScreen = React.lazy(
  () => import('@screens/AddressListScreen'),
);
const CartScreen = React.lazy(() =>
  Promise.resolve(import('@screens/CartScreen')),
);
const Home = React.lazy(() => import('@screens/Home'));
const ItemDetails = React.lazy(() => import('@screens/ItemDetails'));
const LoginScreen = React.lazy(() =>
  Promise.resolve(import('@screens/LoginScreen')),
);
const OrderDetailsScreen = React.lazy(
  () => import('@screens/OrderDetailsScreen'),
);
const OrdersListing = React.lazy(() => import('@screens/OrdersListing'));
const SearchScreen = React.lazy(() => import('@screens/SearchScreen'));
const SelectLocation = React.lazy(() => import('@screens/SelectLocation'));
const SupportScreen = React.lazy(() => import('@screens/SupportScreen'));
const VerifyOTP = React.lazy(() => import('@screens/VerifyOTP'));
const AddressForm = React.lazy(() => import('@screens/AddressForm'));
const PrescriptionOrder = React.lazy(
  () => import('@screens/PrescriptionOrder'),
);
const ItemsListing = React.lazy(() => import('@screens/ItemsListing'));
const DynamicGridScreen = React.lazy(
  () => import('@screens/DynamicGridScreen'),
);
const RegistrationForm = React.lazy(() => import('@screens/RegistrationForm'));

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
  RegistrationForm: undefined;
};

const linkingConfig = () => {
  return {
    screens: {
      Store: {
        path: '', // Remove mode from here
        screens: {
          Home: {
            path: 'home',
            screens: {
              Dashboard: `dashboard`, // Add mode only here
              Search: `search`,
              Cart: `cart`,
            },
          },
          Login: `login`,
          VerifyOTP: `verifyOTP`,
          ItemsListing: `items`,
          DynamicGridScreen: `listing`,
          ItemDetails: `item`,
          Search: `search/:searchItem`,
          Cart: `cart`,
          PrescriptionOrder: `prescription_order`,
          OrdersListing: `orders`,
          OrderDetails: {
            path: `order/:orderId/`,
          },
          AddressListing: `my_addresses`,
          SearchAddress: `search_address`,
          SelectLocation: `select_location`,
          AddressForm: `address_details`,
          Support: `support`,
          RegistrationForm: `registration_details`,
        },
      },
    },
  };
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
    | React.FC<NativeStackScreenProps<RootStackParamList, 'RegistrationForm'>>
    | undefined;
};
const AppNavigator = memo(() => {
  // Regular context hooks for non-form contexts
  const {showToast} = useContext(ToastContext);
  const {statusCode} = useContext(APIContext);
  const {authStatus, setStoreId, setStoreConfig} = useContext(AuthContext);

  // State hooks with initial values
  const [configFetchAttempted, setConfigFetchAttempted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isPickupMode = useIsPickupMode();
  const Stack = createNativeStackNavigator<RootStackParamList>();

  const baseRoutes = useMemo(
    () => [
      {name: 'Login', component: LoginScreen},
      {name: 'VerifyOTP', component: VerifyOTP},
      {name: 'Home', component: Home},
      {name: 'ItemsListing', component: ItemsListing},
      {name: 'DynamicGridScreen', component: DynamicGridScreen},
      {name: 'ItemDetails', component: ItemDetails},
      {name: 'Search', component: SearchScreen},
      {name: 'Cart', component: CartScreen},
      {name: 'PrescriptionOrder', component: PrescriptionOrder},
      {name: 'OrdersListing', component: OrdersListing},
      {name: 'OrderDetails', component: OrderDetailsScreen},
    ],
    [],
  );

  // Dynamic routes based on pickup mode
  const routes = useMemo(
    () => [
      ...baseRoutes,
      ...(!isPickupMode
        ? [
            {name: 'AddressListing', component: AddressListScreen},
            {name: 'SelectLocation', component: SelectLocation},
            {name: 'SearchAddress', component: SearchAddress},
            {name: 'AddressForm', component: AddressForm},
          ]
        : []),
      {name: 'RegistrationForm', component: RegistrationForm},
    ],
    [isPickupMode, baseRoutes],
  );

  // Config fetch with cleanup
  const fetchConfig = useCallback(
    async (storeId: string) => {
      let mounted = true;

      if (
        (authStatus.loggedIn || storeId) &&
        !configFetchAttempted &&
        mounted
      ) {
        try {
          console.log("'Fetching store config...'");

          const response = await APIGet({
            url: getURL({key: 'GET_CONFIG', pathParams: storeId}),
          });
          if (mounted) setStoreConfig(response.data);
        } catch (error) {
          if (mounted) {
            showToast({
              ...ToastProfiles.error,
              title: parseError(error).message || 'Unable to fetch config',
              id: 'config-fetch-error',
            });
          }
        } finally {
          if (mounted) setLoaded(true);
        }
      } else if (mounted) {
        setLoaded(true);
      }

      return () => {
        mounted = false;
      };
    },
    [configFetchAttempted],
  );

  // Initialization effect with cleanup
  useEffect(() => {
    const effectiveStoreId = 'model_medicals_demo';
    setStoreId(effectiveStoreId);
    let cleanup: (() => void) | undefined;
    fetchConfig(effectiveStoreId).then(returnedCleanup => {
      cleanup = returnedCleanup;
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchConfig, setStoreId]);

  // Auth effect
  useEffect(() => {
    if (statusCode === 401 || statusCode === 1001) {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  }, [statusCode, navigation]);

  if (!loaded) {
    return <LoadingScreen />;
  }

  console.log('app');

  return (
    <View style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true, // Prevent unmounted screens from re-rendering
        }}
        initialRouteName={authStatus.loggedIn ? 'Home' : 'Login'}>
        {routes.map(route => {
          const ScreenComponent = route.component;
          return (
            <Stack.Screen
              key={route.name}
              name={route.name as keyof RootStackParamList}>
              {props => (
                <React.Suspense fallback={<LoadingScreen />}>
                  {route.component &&
                    React.createElement(
                      route.component as unknown as React.ComponentType<RouteDefinition>,
                      {
                        ...props,
                        name: route.name as keyof RootStackParamList,
                        component: route.component,
                      },
                    )}
                </React.Suspense>
              )}
            </Stack.Screen>
          );
        })}
      </Stack.Navigator>
    </View>
  );
});

AppNavigator.displayName = 'AppNavigator';

const linking = () => ({
  prefixes: [
    'https://develop.1pharmacy.io',
    'https://webstore.1pharmacy.io',
    'http://localhost:8080',
    'http://192.168.1.30:8080',
    'localhost:8080',
    'onepharmacy://',
  ],
  config: linkingConfig(),
});
// comments added by Milind Pandey

type StoreInfo = {
  storeId: string | null;
  isPickupMode: boolean;
  modeParam?: string | null;
};

// const NavigationContent = (props: any) => {
//   const navigationRef = useNavigationContainerRef();
//   const routeNameRef = useRef<string>();
//   const previousRouteNameRef = useRef<string>();
//   const previousRoutePathParams = useRef<any | undefined>();
//   const [isReady, setIsReady] = useState(false);
//   const [initialState, setInitialState] = useState();
//   const isRestoringRef = useRef(false);
//   const MemoizedSideDrawer = memo(SideDrawer);
//   const MemoizedAppNavigator = memo(AppNavigator);
//   const {setPickupMode} = usePickupMode();
//   // const {storeId, setStoreId} = useContext(AuthContext);
//   const [localStoreInfo, setLocalStoreInfo] = useState<StoreInfo>({
//     storeId: null,
//     isPickupMode: false,
//     modeParam: null,
//   });
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [modeCheckPerformed, setModeCheckPerformed] = useState(false);

//   useEffect(() => {
//     const initializeStoreInfo = async () => {
//       try {
//         // Only check URL if we haven't done it already
//         if (!modeCheckPerformed) {
//           const url = await Linking.getInitialURL();

//           if (url) {
//             const extractedInfo = extractStoreAndMode(url);
//             if (extractedInfo.storeId) {
//               await saveStoreInfo(
//                 extractedInfo.storeId ?? '',
//                 extractedInfo.isPickupMode ?? false,
//                 extractedInfo.modeParam ?? '',
//               );

//               setLocalStoreInfo(extractedInfo);
//               setIsInitialized(true);
//               setModeCheckPerformed(true);
//               return;
//             }
//           }
//         }

//         // Only get from storage if we haven't found info in URL
//         const savedInfo = await loadStoreInfo();
//         setLocalStoreInfo(savedInfo);
//         setIsInitialized(true);
//       } catch (error) {
//         console.error('Error initializing store info:', error);
//         setIsInitialized(true);
//       }
//     };

//     if (!isInitialized) {
//       initializeStoreInfo();
//     }
//   }, [
//     isInitialized,
//     localStoreInfo.storeId,
//     localStoreInfo.isPickupMode,
//     modeCheckPerformed,
//   ]);
//   // Debounced function to save navigation state efficiently
//   const debouncedSaveState = useCallback(
//     debounce(state => {
//       if (!isRestoringRef.current) {
//         navigationStorage.saveState(state);
//       }
//     }, 800),
//     [],
//   );

//   // useLogger(navigationRef);

//   useEffect(() => {
//     let mounted = true;

//     const restoreState = async () => {
//       if (!mounted) return;

//       try {
//         isRestoringRef.current = true;
//         const state = await navigationStorage.loadState();
//         if (mounted && state) {
//           setInitialState(state);
//         }
//       } catch (err) {
//         console.warn('State restoration failed:', err);
//       } finally {
//         if (mounted) {
//           setIsReady(true);
//           isRestoringRef.current = false;
//         }
//       }
//     };

//     if (!isReady) {
//       restoreState();
//     }

//     return () => {
//       mounted = false;
//       debouncedSaveState.cancel();
//     };
//   }, [isReady, debouncedSaveState]);

//   const onStateChange = useCallback(
//     (state: any) => {
//       const currentRoute = navigationRef.current?.getCurrentRoute();
//       const currentRouteName = currentRoute?.name;
//       routeNameRef.current = currentRouteName;
//       const currentPathParams = currentRoute?.params;
//       if (
//         currentRouteName !== previousRouteNameRef.current ||
//         (currentPathParams && 'itemId' in currentPathParams) !==
//           'itemId' in previousRoutePathParams
//       ) {
//         debouncedSaveState(state);
//         previousRouteNameRef.current = currentRouteName;
//       }
//     },
//     [debouncedSaveState],
//   );

//   if (!isReady) {
//     return null;
//   }

//   return (
//     <NavigationContainer
//       theme={_1PTheme}
//       linking={linking(
//         localStoreInfo.storeId ?? null,
//         localStoreInfo.modeParam ?? null,
//       )}
//       ref={navigationRef}
//       initialState={initialState}
//       onStateChange={onStateChange}
//       fallback={<LoadingScreen />}>
//       <MemoizedSideDrawer
//         component={MemoizedAppNavigator}
//         // storeIdFromUrl={localStoreInfo.storeId}
//         // isPickupMode={localStoreInfo.isPickupMode}
//       />
//     </NavigationContainer>
//   );
// };

// const AppContent = (props: any) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const mountedRef = useRef(true);

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         // await new Promise(resolve => setTimeout(resolve, 800));
//       } finally {
//         if (mountedRef.current) {
//           setIsLoading(false);
//         }
//       }
//     };

//     initializeApp();

//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);

//   if (isLoading) {
//     return <LoadingScreen />;
//   }

//   return (
//     <PickupModeProvider>
//       <FormStateProvider>
//         <NavigationContent />
//       </FormStateProvider>
//     </PickupModeProvider>
//   );
// };

function App(): JSX.Element {
  useEffect(() => {
    // Ask for notification permission
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted.');
        getFcmToken();
      } else {
        console.log('Notification permission denied.');
      }
    };

    // Get and log the FCM token
    const getFcmToken = async () => {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    };

    // Foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        'New Notification',
        remoteMessage.notification?.body ?? 'No message body',
      );
      console.log('Foreground notification:', remoteMessage);
    });

    requestPermission();

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
    }
    createChannel();
  }, []);

  return (
    <NativeBaseProvider theme={_1PNativeBaseTheme}>
      <ToastProvider>
        <AuthContextProvider>
          <APIContextProvider>
            <PickupModeProvider>
              <FormStateProvider>
                {/* <React.Suspense fallback={<LoadingScreen />}> */}
                <NavigationContainer theme={_1PTheme} linking={linking()}>
                  <View style={{flex: 1}}>
                    <SideDrawer component={() => <AppNavigator />} />
                  </View>
                </NavigationContainer>
                {/* </React.Suspense> */}
              </FormStateProvider>
            </PickupModeProvider>
          </APIContextProvider>
        </AuthContextProvider>
      </ToastProvider>
    </NativeBaseProvider>
    // <NativeBaseProvider theme={_1PNativeBaseTheme}>
    //   <View>
    //     <Button onPress={() => window.alert('test')}>
    //       <Text>Test</Text>
    //     </Button>
    //   </View>
    // </NativeBaseProvider>
  );
}

export default App;
