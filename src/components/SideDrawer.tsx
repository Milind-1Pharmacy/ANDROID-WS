import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Divider, ScrollView, Text, VStack, View, Pressable} from 'native-base';
import {Animated, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {AuthContext, FormStateContext, ToastContext} from '@contextProviders';
import {useContextSelector} from 'use-context-selector';
import {
  faHome,
  faSearch,
  faShoppingCart,
  faPrescriptionBottle,
  faBoxOpen,
  faMapMarkerAlt,
  faHeadset,
  faRightToBracket,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import P1AlertDialog from './commonComponents/P1AlertDialog';
import {ToastProfiles} from '@ToastProfiles';
import {background} from 'native-base/lib/typescript/theme/styled-system';

type SideNavItem = {
  label: string;
  action: 'NAVIGATE' | 'TAB_SWITCH';
  screen: string;
  icon: any;
  calculateBadge?: (cart: any) => number;
  badgeActive?: (cart: any) => boolean;
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  drawerContentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    backgroundColor: '#F7FAFD',
    borderRadius: 16,
    margin: 8,
    padding: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E6ACF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  sideNavBlock: {
    flex: 1,
    paddingVertical: 12,
  },
  navListItem: {
    padding: 16,
    paddingLeft: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  navListItemActive: {
    backgroundColor: '#EBF4FF',
    borderRadius: 5,
  },
  navListItemLabel: {
    fontSize: 17,
    color: '#1A1A1A',
    flex: 1,
  },
  navListItemLabelActive: {
    color: '#2E6ACF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  logOutButton: {
    padding: 12,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D4F',
    borderRadius: 12,
    justifyContent: 'center',
  },
  logInButton: {
    padding: 12,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E6ACF',
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 4,
  },
});

const Drawer = createDrawerNavigator();

const P1Drawer = memo((props: any) => {
  const {cart = {items: []}} = useContextSelector(FormStateContext, state => ({
    cart: state.cart || {items: []},
  }));

  const {authStatus} = useContext(AuthContext);
  const [activeItem, setActiveItem] = useState('');
  const {showToast} = useContext(ToastContext);

  const navList: SideNavItem[] = useMemo(
    () => [
      {
        label: 'Home',
        action: 'TAB_SWITCH',
        screen: 'Dashboard',
        icon: faHome,
      },
      {
        label: 'Search',
        action: 'TAB_SWITCH',
        screen: 'Search',
        icon: faSearch,
      },
      {
        label: 'Cart',
        action: 'TAB_SWITCH',
        screen: 'Cart',
        icon: faShoppingCart,
        calculateBadge: cart => cart.items?.length || 0,
        badgeActive: cart => (cart.items?.length || 0) > 0,
      },
      {
        label: 'Order via Prescription',
        action: 'NAVIGATE',
        screen: 'PrescriptionOrder',
        icon: faPrescriptionBottle,
      },
      {
        label: 'My Orders',
        action: 'NAVIGATE',
        screen: 'OrdersListing',
        icon: faBoxOpen,
      },
      {
        label: 'My Addresses',
        action: 'NAVIGATE',
        screen: 'AddressListing',
        icon: faMapMarkerAlt,
      },
      {
        label: 'Support',
        action: 'NAVIGATE',
        screen: 'Support',
        icon: faHeadset,
      },
    ],
    [],
  );

  const handleNavPress = useCallback(
    (item: SideNavItem) => {
      if (item.screen !== activeItem) {
        // setActiveItem(item.screen);
        props.navActions[item.action](item);
        props.navigation.dispatch(DrawerActions.closeDrawer());
      }
    },
    [activeItem, props.navActions, props.navigation],
  );

  const {user = {}} = authStatus || {};

  return (
    <View style={styles.drawerContentContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())}>
        <FontAwesomeIcon icon="times" color="#2E6ACF" size={24} />
      </TouchableOpacity>

      <VStack flex={1}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                : 'G'}
            </Text>
          </View>
          <Text style={styles.navListItemLabel}>{user?.name || 'GUEST'}</Text>
          {authStatus.loggedIn && (
            <Text style={{fontSize: 14, color: '#666666'}}>
              Phone: {user?.phone?.slice(2) || ''}
            </Text>
          )}
        </View>

        {/* Navigation Items */}
        <ScrollView
          style={styles.sideNavBlock}
          showsVerticalScrollIndicator={false}>
          {navList.map((item, index) => (
            <React.Fragment key={item.screen}>
              <Pressable
                style={[
                  styles.navListItem,
                  activeItem === item.screen && styles.navListItemActive,
                ]}
                onPress={() => handleNavPress(item)}>
                <FontAwesomeIcon
                  icon={item.icon}
                  size={16}
                  color={activeItem === item.screen ? '#2E6ACF' : '#1A1A1A'}
                />
                <Text
                  style={[
                    styles.navListItemLabel,
                    activeItem === item.screen && styles.navListItemLabelActive,
                  ]}>
                  {item.label}
                </Text>
                {item.badgeActive?.(cart) && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.calculateBadge?.(cart)}
                    </Text>
                  </View>
                )}
              </Pressable>
              {index < navList.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Login/Logout Button */}
        <View style={{padding: 16}}>
          <TouchableOpacity
            style={
              authStatus.loggedIn ? styles.logOutButton : styles.logInButton
            }
            onPress={
              authStatus.loggedIn
                ? props.toggleLogOutDialogOpen
                : () => props.navigation.navigate('Login')
            }>
            <FontAwesomeIcon
              icon={authStatus.loggedIn ? faRightFromBracket : faRightToBracket}
              color="#FFFFFF"
              size={16}
            />
            <Text style={styles.buttonText}>
              {authStatus.loggedIn ? 'Logout' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </VStack>

      {/* Logout Confirmation Dialog */}
      <P1AlertDialog
        heading="Logout?"
        body="Are you sure you want to logout?"
        isOpen={props.logOutDialogOpen}
        toggleOpen={props.toggleLogOutDialogOpen}
        buttons={[
          {
            label: 'Logout',
            style: styles.logOutButton,
            action: async () => {
              try {
                await props.userLogOut();
                props.navigation.dispatch(DrawerActions.closeDrawer());
                props.toggleLogOutDialogOpen();
                props.navigation.navigate('Login');
                showToast({
                  ...ToastProfiles.success,
                  title: 'Logged out successfully',
                  id: 'logout-success',
                });
              } catch (error) {
                console.error('Logout failed', error);
              }
            },
          },
        ]}
      />
    </View>
  );
});

const SideDrawer = ({component: Component}: {component: React.FC}) => {
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);
  const {authStatus, userLogOut} = useContext(AuthContext);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const navigate = useCallback(
    (item: SideNavItem) => {
      navigation.dispatch(DrawerActions.closeDrawer());
      navigation.navigate(item.screen as any);
    },
    [navigation],
  );

  const tabSwitch = useCallback(
    (item: SideNavItem) => {
      navigation.dispatch(DrawerActions.closeDrawer());
      navigation.navigate('Home', {initialTab: item.screen});
    },
    [navigation],
  );

  const navActions = useMemo(
    () => ({
      NAVIGATE: navigate,
      TAB_SWITCH: tabSwitch,
    }),
    [navigate, tabSwitch],
  );

  const toggleLogOutDialogOpen = useCallback(() => {
    setLogOutDialogOpen(prev => !prev);
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerPosition: 'left',
        headerShown: false,
        swipeEnabled: true,
        swipeEdgeWidth: authStatus.loggedIn ? 75 : 0,
        drawerType: 'front',
        drawerStyle: {
          width: width * 0.8,
          backgroundColor: '#FFFFFF',
        },
      }}
      drawerContent={props => (
        <P1Drawer
          {...props}
          authStatus={authStatus}
          navActions={navActions}
          toggleLogOutDialogOpen={toggleLogOutDialogOpen}
          logOutDialogOpen={logOutDialogOpen}
          userLogOut={userLogOut}
          navigation={navigation}
        />
      )}>
      <Drawer.Screen name="Store">
        {(props: any) => <Component {...props} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default memo(SideDrawer);
