import {memo} from 'react';
import {Cart} from '@commonComponents';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {ScreenBase} from '@Containers';
import React from 'react';

const CartScreen = memo(
  ({navigation}: NativeStackScreenProps<RootStackParamList, 'Cart'>) => {
    return (
      <ScreenBase>
        <Cart navigation={navigation} />
      </ScreenBase>
    );
  },
);

export default CartScreen;
