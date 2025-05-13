// HomeTabs.tsx with integrated AnimatedTabNavigator
import React, {Fragment, useEffect, useContext, useMemo} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPills,
  faSearch,
  faShoppingCart,
  faUser,
  faPrescription,
} from '@fortawesome/free-solid-svg-icons';
import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {AuthContext, FormStateContext} from '@contextProviders';
import {useContextSelector} from 'use-context-selector';
import Emitter from '@Emitter';
import {UserRoleAlias} from '@Constants';
import DashboardTabPanel from './DashboardTabPanel';
import SearchTabPanel from './SearchTabPanel';
import CartTabPanel from './CartTabPanel';
import { AnimatedTabNavigator } from '@commonComponents';

const {width} = Dimensions.get('window');

const HomeTabs = ({
  initialTab,
  stackNavigation,
}: {
  initialTab?: string;
  stackNavigation: any;
}) => {
  const Tab = createBottomTabNavigator();
  const {appMode} = useContext(AuthContext);
  const {cart} = useContextSelector(FormStateContext, state => ({
    cart: state.cart || {items: []},
  }));
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

  const cartItemCount = useMemo(() => cart.items?.length || 0, [cart.items]);

  useEffect(() => {
    const onTabSwitch = (event: any) => {
      navigation.navigate(event.screen, event.params);
    };

    if (initialTab) {
      navigation.navigate(initialTab);
    }

    Emitter.on('TAB_SWITCH', onTabSwitch);
    return () => {
      Emitter.off('TAB_SWITCH', onTabSwitch);
    };
  }, [initialTab, navigation]);

  // Custom handler for tab press for the animated navigator
  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'QR') {
      stackNavigation.navigate('PrescriptionOrder');
    } else if (tabKey === 'Profile') {
      stackNavigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <Tab.Navigator
      tabBar={props => (
        <AnimatedTabNavigator
          {...props}
          onTabPress={handleTabPress}
          initialTab={initialTab}
          cartItemCount={cartItemCount}
          // Custom tab icons if needed
          tabConfig={{
            Dashboard: {icon: faPills, label: 'Home'},
            Search: {icon: faSearch, label: 'Search'},
            QR: {icon: faPrescription, label: 'Orders'},
            Cart: {icon: faShoppingCart, label: 'Cart'},
            Profile: {icon: faUser, label: 'Profile'},
          }}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Dashboard" component={DashboardTabPanel} />

      <Tab.Screen name="Search" component={SearchTabPanel} />

      {appMode === UserRoleAlias.CUSTOMER && (
        <Tab.Screen name="QR" component={Fragment} />
      )}

      <Tab.Screen name="Cart" component={CartTabPanel} />

      <Tab.Screen name="Profile" component={Fragment} />
    </Tab.Navigator>
  );
};

export default React.memo(HomeTabs);
