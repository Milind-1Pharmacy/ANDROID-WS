import React, {
  Fragment,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {View} from 'native-base';
import {AuthContext, FormStateContext} from '@contextProviders';
import {useContextSelector} from 'use-context-selector';
import Emitter from '@Emitter';
import {UserRoleAlias} from '@Constants';
import DashboardTabPanel from './DashboardTabPanel';
import SearchTabPanel from './SearchTabPanel';
import CartTabPanel from './CartTabPanel';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: 72,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarFAB: {
    backgroundColor: '#2E6ACF',
    height: 54,
    width: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tabBarHandle: {
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#F1F9FF',
  },
  activeIcon: {
    color: '#2E6ACF',
  },
  inactiveIcon: {
    color: '#D0D0D0',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: 12,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4D4F',
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

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
  const {bottom} = useSafeAreaInsets();

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

  const renderTabButton = useCallback(
    ({children, onPress, focused}: any) => (
      <TouchableOpacity
        style={[styles.tabBarHandle, focused && styles.activeTab]}
        onPress={onPress}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    ),
    [],
  );

  const renderCartTabButton = useCallback(
    ({children, onPress, focused}: any) => (
      <View position="relative">
        <TouchableOpacity
          style={[styles.tabBarHandle, focused && styles.activeTab]}
          onPress={onPress}
          activeOpacity={0.7}>
          {cartItemCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
          {children}
        </TouchableOpacity>
      </View>
    ),
    [cartItemCount],
  );

  const renderProfileTabButton = useCallback(
    ({children}: any) => (
      <TouchableOpacity
        style={styles.tabBarHandle}
        onPress={() => stackNavigation.dispatch(DrawerActions.openDrawer())}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    ),
    [stackNavigation],
  );

  const renderQRTabButton = useCallback(
    ({children}: any) => (
      <TouchableOpacity
        style={styles.tabBarFAB}
        onPress={() => stackNavigation.navigate('PrescriptionOrder')}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    ),
    [stackNavigation],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {paddingBottom: bottom > 0 ? bottom - 8 : 8},
        ],
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardTabPanel}
        options={{
          tabBarIcon: ({focused}) => (
            <FontAwesomeIcon
              icon={faPills}
              size={28}
              style={focused ? styles.activeIcon : styles.inactiveIcon}
            />
          ),
          tabBarButton: renderTabButton,
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchTabPanel}
        options={{
          tabBarIcon: ({focused}) => (
            <FontAwesomeIcon
              icon={faSearch}
              size={24}
              style={focused ? styles.activeIcon : styles.inactiveIcon}
            />
          ),
          tabBarButton: renderTabButton,
        }}
      />

      {appMode === UserRoleAlias.CUSTOMER && (
        <Tab.Screen
          name="QR"
          component={Fragment}
          options={{
            tabBarIcon: () => (
              <FontAwesomeIcon
                icon={faPrescription}
                size={24}
                color="#FFFFFF"
              />
            ),
            tabBarButton: renderQRTabButton,
          }}
        />
      )}

      <Tab.Screen
        name="Cart"
        component={CartTabPanel}
        options={{
          tabBarIcon: ({focused}) => (
            <FontAwesomeIcon
              icon={faShoppingCart}
              size={24}
              style={focused ? styles.activeIcon : styles.inactiveIcon}
            />
          ),
          tabBarButton: renderCartTabButton,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Fragment}
        options={{
          tabBarIcon: ({focused}) => (
            <FontAwesomeIcon
              icon={faUser}
              size={24}
              style={focused ? styles.activeIcon : styles.inactiveIcon}
            />
          ),
          tabBarButton: renderProfileTabButton,
        }}
      />
    </Tab.Navigator>
  );
};

export default React.memo(HomeTabs);
