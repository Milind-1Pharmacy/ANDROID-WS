import {Cart} from '@commonComponents';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import React from 'react';

const CartTabPanel = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return <Cart navigation={navigation} bottomTabsMounted />;
};

export default CartTabPanel;
