import {NativeStackScreenProps} from '@react-navigation/native-stack';
import OrderDetails from '../commonComponents/OrderDetails';
import {RootStackParamList} from 'App';
import React from 'react';
import {ScreenBase} from '@Containers';

const OrderDetailsScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'OrderDetails'>) => {
  return (
    <ScreenBase>
      <OrderDetails navigation={navigation} orderId={route.params.orderId} />
    </ScreenBase>
  );
};

export default OrderDetailsScreen;
