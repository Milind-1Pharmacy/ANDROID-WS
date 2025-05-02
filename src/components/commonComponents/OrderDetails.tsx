
import {getURL} from '@APIRepository';
import P1Styles from '@P1StyleSheet';
import {ToastProfiles} from '@ToastProfiles';
import {APIContext, ToastContext} from '@contextProviders';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  Divider,
  HStack,
  IconButton,
  ScrollView,
  Text,
  VStack,
  View,
} from 'native-base';
import React, {useContext} from 'react';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import TimelineEvent from './TimelineEvent';
import LoadingScreen from './LoadingScreen';
import Header from './Header';
import {parseError} from '@helpers';

const {width: screenWidth, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && screenWidth > height;

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: isDesktop ? '99%' : '100%',
    marginHorizontal: isDesktop ? 10 : 0,
    marginTop: isDesktop ? 10 : 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-end',
    ...(isDesktop ? P1Styles.shadowTop : P1Styles.shadowTopLarge),
  },
  contentContainerStyle: {
    paddingBottom: 100,
  },
});

const orderSummary = [
  {
    title: 'Sub-Total',
    key: 'subTotal',
    valueFormatter: (value: any) =>
      `₹ ${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`,
  },
  {
    title: 'Shipping',
    key: 'shipping',
    valueFormatter: (value: any) =>
      `₹ ${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`,
  },
  {
    title: 'Estimated Tax',
    key: 'totalGst',
    valueFormatter: (value: any) =>
      `₹ ${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`,
  },
  {
    title: 'Total',
    key: 'total',
    valueFormatter: (value: any) =>
      `₹ ${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`,
  },
  {
    title: 'Payment Status',
    key: 'paymentStatus',
    valueFormatter: (value: any) => value,
  },
];

const OrderDetails = (props: any) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [renderData, setRenderData] = React.useState<any>({});

  const {APIGet} = useContext(APIContext);

  const {showToast} = useContext(ToastContext);

  const fetchRenderData = (onComplete: Function = () => {}) => {
    APIGet({
      url: getURL({
        key: 'ORDER_TRACK',
        pathParams: props.orderId,
        queryParams: {
          platform: 'webstore',
        },
      }),
      resolve: (response: any) => {
        if (response.statusCode !== 200) {
          throw response;
        }

        onComplete();

        setRenderData(response.data);
        setLoading(false);
      },
      reject: (error: any) => {
        showToast({
          ...ToastProfiles.error,
          title: parseError(error).message,
          id: 'dashboard-fetch-error',
        });
      },
    });
  };

  const refresh = () => {
    setRefreshing(true);
    fetchRenderData(() => setRefreshing(false));
  };

  React.useEffect(() => {
    fetchRenderData();
  }, [props.orderId]);

  return (
    <>
      <VStack
        h="100%"
        bgColor={isDesktop ? '#EFEFEF' : '#2E6ACF'}
        alignItems="center">
        <Header
          loading={loading}
          screenTitle={renderData?.orderDetails?.orderNo}
          screenTitleLoadingPlaceholder="Order Details"
          textColor={isDesktop ? '#2E6ACF' : '#FFFFFF'}
        />
        <View style={styles.contentBase}>
          {loading ? (
            <LoadingScreen />
          ) : (
            <ScrollView width="100%" height="100%" px={3} py={2}>
              <Text
                mx={3}
                my={2}
                fontWeight="600"
                fontSize={16}
                textTransform="capitalize">
                {renderData.orderDetails.store}
              </Text>
              {orderSummary.map((item, index) => (
                <HStack
                  key={index}
                  mx={4}
                  mb={1}
                  alignItems="center"
                  justifyContent="space-between">
                  <Text
                    fontWeight="500"
                    fontSize={14}
                    textTransform="capitalize">
                    {item.title}
                  </Text>
                  <Text
                    fontWeight="400"
                    fontSize={14}
                    textTransform="capitalize">
                    {item.valueFormatter(renderData.paymentDetails[item.key])}
                  </Text>
                </HStack>
              ))}
              <Divider my={3} />
              {renderData.status === 'waiting_to_respond' ? (
                <VStack py={10} alignItems="center" space={3}>
                  <FontAwesomeIcon
                    icon="hourglass-half"
                    size={50}
                    color="#3F3E60"
                  />
                  <Text bold color="#3F3E60" fontSize={18}>
                    Your order is confirmed
                  </Text>
                  {/* <Text color="#3F3E60">Order is confirmed</Text> */}
                  {/* <Text color="#3F3E60">
                    Applying the <Text bold>BELONG</Text> discount 😊
                  </Text> */}
                  <Text fontSize={17} textAlign="center" color="#3F3E60">
                    Very shortly, you will receive a{' '}
                    <Text bold>payment link on Whatsapp</Text>
                  </Text>
                </VStack>
              ) : (
                renderData.orderDetails?.timeline?.map(
                  (event: any, index: number) => (
                    <TimelineEvent
                      key={index}
                      event={{
                        title: event.title,
                        subtitle: event.subtitle,
                        isLast:
                          index ===
                          renderData.orderDetails?.timeline?.length - 1,
                        status: event.status,
                        index: index + 1,
                        button: event.button,
                      }}
                    />
                  ),
                )
              )}
            </ScrollView>
          )}
        </View>
      </VStack>
    </>
  );
};

export default OrderDetails;
