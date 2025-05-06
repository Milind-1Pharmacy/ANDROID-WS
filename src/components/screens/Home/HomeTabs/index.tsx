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
    height: 68,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    backgroundColor: 'white',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarContent: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly', // This ensures even spacing
    alignItems: 'center',
  },
  tabBarFAB: {
    backgroundColor: '#2E6ACF',
    height: 52,
    width: 52,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
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
    right: -4, // Adjusted from right: 12 to better position the badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4D4F',
    zIndex: 1,
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

  // Custom tab bar component to ensure proper spacing
  const CustomTabBar = ({state, descriptors, navigation}: any) => {
    const {bottom} = useSafeAreaInsets();

    return (
      <View
        style={[styles.tabBar, {paddingBottom: bottom > 0 ? bottom - 8 : 8}]}>
        <View style={styles.tabBarContent}>
          {state.routes.map((route: any, index: number) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (route.name === 'QR') {
              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.tabBarFAB}
                  onPress={() => stackNavigation.navigate('PrescriptionOrder')}
                  activeOpacity={0.7}>
                  <FontAwesomeIcon
                    icon={faPrescription}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              );
            }

            if (route.name === 'Profile') {
              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.tabBarHandle}
                  onPress={() =>
                    stackNavigation.dispatch(DrawerActions.openDrawer())
                  }
                  activeOpacity={0.7}>
                  <FontAwesomeIcon
                    icon={faUser}
                    size={24}
                    style={isFocused ? styles.activeIcon : styles.inactiveIcon}
                  />
                </TouchableOpacity>
              );
            }

            if (route.name === 'Cart') {
              return (
                <View key={route.key} position="relative">
                  <TouchableOpacity
                    style={[styles.tabBarHandle, isFocused && styles.activeTab]}
                    onPress={onPress}
                    activeOpacity={0.7}>
                    {cartItemCount > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{cartItemCount}</Text>
                      </View>
                    )}
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      size={24}
                      style={
                        isFocused ? styles.activeIcon : styles.inactiveIcon
                      }
                    />
                  </TouchableOpacity>
                </View>
              );
            }

            let icon;
            switch (route.name) {
              case 'Dashboard':
                icon = faPills;
                break;
              case 'Search':
                icon = faSearch;
                break;
              default:
                icon = faPills;
            }

            return (
              <TouchableOpacity
                key={route.key}
                style={[styles.tabBarHandle, isFocused && styles.activeTab]}
                onPress={onPress}
                activeOpacity={0.7}>
                <FontAwesomeIcon
                  icon={icon}
                  size={route.name === 'Dashboard' ? 28 : 24}
                  style={isFocused ? styles.activeIcon : styles.inactiveIcon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
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
