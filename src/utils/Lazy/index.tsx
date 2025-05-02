import {LoadingScreen} from '@commonComponents';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import React, {LazyExoticComponent, Suspense} from 'react';

type LazyScreenComponent =
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'Home'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'Login'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'ItemsListing'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'DynamicGridScreen'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'ItemDetails'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'Search'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'Cart'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'PrescriptionOrder'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'OrdersListing'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'OrderDetails'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'AddressListing'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'SearchAddress'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'SelectLocation'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'AddressForm'>>
    >
  | LazyExoticComponent<
      React.FC<NativeStackScreenProps<RootStackParamList, 'Support'>>
    >;

export const suspensify = (Component: LazyScreenComponent) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);
