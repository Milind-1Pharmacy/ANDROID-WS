import {useEffect, useState, useContext} from 'react';
import {getURL} from '@APIRepository';
import {APIContext, AuthContext, ToastContext} from '@contextProviders';
import {ToastProfiles} from '@ToastProfiles';
import {
  Box,
  HStack,
  IconButton,
  StatusBar,
  Text,
  VStack,
  View,
} from 'native-base';
import moment from 'moment';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import {Header, LoadingScreen, P1AlertDialog} from '@commonComponents';
import {ScreenBase, ListView} from '@Containers';
import P1Styles from '@P1StyleSheet';
import {RUPEE_SYMBOL} from '@Constants';
import {RootStackParamList} from 'App';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {parseError} from '@helpers';
import React from 'react';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#ff00000',
  },
  contentContainerStyle: {
    width: isDesktop ? '99%' : '100%',
    flexGrow: 1,
    marginHorizontal: isDesktop ? 10 : 0,
    marginTop: isDesktop ? 10 : 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
  itemsQtyBadgeButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  itemsQtyBadgeButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logOutConfirmButton: {
    backgroundColor: '#2E6ACF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
});

const cardPropParser = (item: any) => ({
  id: item.id,
  title: item.orderNo,
  subtitle: item.status,
  details: [
    ...((item.status || '').toLowerCase() === 'delivered'
      ? [`Delivered On: ${moment.unix(item.deliveredOn).format('DD-MMM-YYYY')}`]
      : [
          `Estimated Delivery: ${moment
            .unix(item.estimatedDelivery)
            .format('DD-MMM-YYYY')}`,
        ]),
    `Total Amount: ${RUPEE_SYMBOL} ${item.items
      .reduce((acc: number, curr: any) => acc + (curr.totalPrice || 0), 0)
      .toLocaleString('en-US', {maxFractionDigits: 2})}`,
  ],
  badge: (
    <View style={{...P1Styles.shadow, borderRadius: 20}}>
      <View style={styles.itemsQtyBadgeButton}>
        <Text style={styles.itemsQtyBadgeButtonLabel}>
          {`${(item.items || []).length} item(s)`}
        </Text>
      </View>
    </View>
  ),
  nestedList: item.items.map((nestedListItem: any) => ({
    id: nestedListItem.id,
    title: nestedListItem.name,
    subtitle: `Qty: ${nestedListItem.orderedQty}`,
    details: [
      `MRP: ${RUPEE_SYMBOL} ${
        nestedListItem.mrp
          ? nestedListItem.mrp.toLocaleString('en-US', {maxFractionDigits: 2})
          : '-'
      }`,
      `Total: ${RUPEE_SYMBOL} ${
        nestedListItem.totalPrice
          ? nestedListItem.totalPrice.toLocaleString('en-US', {
              maxFractionDigits: 2,
            })
          : '-'
      }`,
    ],
  })),
});

const OrdersListing = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'OrdersListing'>) => {
  const [mounted, setMounted] = useState(false);
  const [ordersData, setOrdersData] = useState<{
    [key: string]: any | undefined;
  }>({loaded: false});
  const [loading, setLoading] = useState<boolean>(true);
  const [logOutDialogOpen, setLogOutDialogOpen] = useState(false);

  const toggleLogOutDialogOpen = () => {
    if (logOutDialogOpen) {
      navigation.goBack();
    }

    setLogOutDialogOpen(!logOutDialogOpen);
  };

  const {authStatus} = useContext(AuthContext);

  const {APIGet} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  const fetchRenderData = ({
    onCompleteCallback,
    isRefreshing,
  }: {
    onCompleteCallback?: Function;
    isRefreshing?: boolean;
  }) => {
    if (!isRefreshing) {
      setLoading(true);
      setOrdersData({...ordersData, loaded: false});
    }
    APIGet({
      url: getURL({
        key: 'ORDER_LISTING',
      }),
      resolve: (response: any) => {
        if (!response.data) {
          throw response;
        }

        setOrdersData({
          ...response.data,
          items: (response.data?.items || []).map((item: any) => ({
            ...item,
            card_id: 'card_5',
          })),
          loaded: true,
        });

        if (!mounted) {
          setMounted(true);
        }

        setLoading(false);

        (onCompleteCallback || (() => {}))();
      },
      reject: (error: any) => {
        showToast({...ToastProfiles.error, title: parseError(error).message});

        if (!mounted) {
          setMounted(true);
        }

        (onCompleteCallback || (() => {}))();
      },
    });
  };

  useEffect(() => {
    if (!mounted && authStatus.loggedIn) {
      fetchRenderData({});
    }
  }, [mounted]);

  const onRefresh = (setRefreshing: Function) => {
    setRefreshing(true);
    fetchRenderData({
      onCompleteCallback: () => setRefreshing(false),
      isRefreshing: true,
    });
  };

  const goToLogin = () => {
    toggleLogOutDialogOpen();
    navigation.navigate('Login');
  };

  useEffect(() => {
    if (!authStatus.loggedIn) {
      toggleLogOutDialogOpen();
    }
  }, []);

  return (
    <ScreenBase>
      <VStack h="100%" bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}>
        <Header
          screenTitle="My Orders"
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        {loading ? (
          <LoadingScreen />
        ) : (
          <ListView
            style={styles.contentBase}
            contentContainerStyle={styles.contentContainerStyle}
            onRefresh={onRefresh}
            list={(ordersData.items || []).map((item: any) => ({
              ...item,
              action: 'navigate',
              actionParams: [
                'OrderDetails',
                {
                  orderId: item.id,
                },
              ],
            }))}
            searchFilter={(keyword: string, item: any) =>
              new RegExp(`^${keyword}`, 'i').test(item.orderNo)
            }
            cardPropParser={cardPropParser}
          />
        )}
      </VStack>
      <P1AlertDialog
        heading="You need to log-in first"
        body="To view your past orders, you need to be logged in. Please login to continue."
        isOpen={logOutDialogOpen}
        toggleOpen={toggleLogOutDialogOpen}
        buttons={[
          {
            label: 'Proceed to Login',
            variant: 'solid',
            style: {...styles.logOutConfirmButton, backgroundColor: '#D00000'},
            action: goToLogin,
          },
        ]}
      />
    </ScreenBase>
  );
};

export default OrdersListing;
