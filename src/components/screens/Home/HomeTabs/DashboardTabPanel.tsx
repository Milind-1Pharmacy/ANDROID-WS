import React, {
  useContext,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import {Button, HStack, ScrollView, Text, VStack, View} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCartShopping,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useContextSelector} from 'use-context-selector';

import {StoreBanner} from '@commonComponents';
import {DynamicView} from '@Containers';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {getURL} from '@APIRepository';
import {ToastProfiles} from '@ToastProfiles';
import {parseError} from '@helpers';
import {RootStackParamList} from 'App';
import P1Styles from '@P1StyleSheet';

interface DashboardTabPanelProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const DashboardTabPanel: React.FC<DashboardTabPanelProps> = ({navigation}) => {
  const {authStatus, storeId} = useContext(AuthContext);
  const {cart} = useContextSelector(FormStateContext, state => ({
    cart: state.cart || {items: []},
  }));
  const {APIGet} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renderData, setRenderData] = useState<any>({});

  const {width, height} = useWindowDimensions();
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isDesktop = width > height;
  const hasStoreAccess = authStatus.loggedIn || storeId;
  const searchPlaceholderText = 'Your wellness, one search away!';

  const headerActions = useMemo(
    () => [
      {
        icon: faCartShopping,
        badge: cart.items?.length,
        badgeActive: cart.items?.length > 0,
        onPress: () => navigation.push('Cart'),
      },
    ],
    [cart.items?.length, navigation],
  );

  const fetchRenderData = useCallback(
    async (onComplete: () => void = () => {}) => {
      console.log('fetchRenderData');

      if (!hasStoreAccess) return;

      try {
        const url = getURL(
          authStatus.loggedIn
            ? {key: 'GET_DASHBOARD'}
            : {key: 'GET_DASHBOARD', pathParams: storeId},
        );

        const response = await APIGet({url});

        if (response.statusCode !== 200) {
          throw response;
        }

        setRenderData(response.data);
      } catch (error) {
        showToast({
          ...ToastProfiles.error,
          title: parseError(error).message,
          id: 'dashboard-fetch-error',
        });
        console.error(error);
      } finally {
        onComplete();
        setLoading(false);
      }
    },
    [hasStoreAccess, authStatus.loggedIn, storeId, APIGet, showToast],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRenderData(() => setRefreshing(false));
  };

  const navigateToSearch = () => navigation.push('Search');
  const navigateToLogin = () => stackNavigation.navigate('Login');

  useEffect(() => {
    if (hasStoreAccess) {
      fetchRenderData();
    }
  }, [hasStoreAccess, fetchRenderData]);

  const renderSearchBox = () => (
    <TouchableOpacity onPress={navigateToSearch} style={styles.searchBox}>
      <HStack style={styles.searchBoxTextBlock}>
        <FontAwesomeIcon icon={faMagnifyingGlass} color="#5A5A5A" size={18} />
        <Text style={styles.searchBoxPlaceholder}>{searchPlaceholderText}</Text>
      </HStack>
    </TouchableOpacity>
  );

  const renderUnauthenticatedView = () => (
    <VStack style={styles.unAuthenticatedBlock}>
      <Text>Please login to view your dashboard</Text>
      <Button style={styles.proceedToLoginButton} onPress={navigateToLogin}>
        Proceed To Login
      </Button>
    </VStack>
  );

  const renderContent = () => (
    <>
      {!isDesktop && renderSearchBox()}
      <DynamicView loading={loading} sections={renderData.sections} />
      {loading && <View style={{height: 300}} />}
      <View height={20} style={styles.contentEndBuffer} />
    </>
  );

  return (
    <VStack flex={1} bg="#F0f2f5">
      <StoreBanner
        loading={loading}
        storeName={renderData?.stores?.selectedStore}
        imageUrl={renderData?.stores?.imageUrl}
        bannerBaseStyle={styles.bannerBaseStyle}
        actions={headerActions}
        customerName={authStatus?.user?.name}
      />

      {isDesktop && renderSearchBox()}

      <View style={{flex: 1}}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              colors={['#FFFFFF']}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }>
          {hasStoreAccess ? renderContent() : renderUnauthenticatedView()}
        </ScrollView>
      </View>
    </VStack>
  );
};

const styles = StyleSheet.create({
  bannerBaseStyle: {
    padding: 0,
  },
  unAuthenticatedBlock: {
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginVertical: 100,
    ...P1Styles.shadow,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  searchBox: {
    marginHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginVertical: 14,
    ...P1Styles.shadow,
  },
  searchBoxTextBlock: {
    padding: 14,
    columnGap: 5,
    alignItems: 'center',
  },
  searchBoxPlaceholder: {
    color: '#5A5A5A',
    fontSize: 16,
  },
  contentEndBuffer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#F0f2f5',
  },
  proceedToLoginButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

export default DashboardTabPanel;
