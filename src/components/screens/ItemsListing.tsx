import React, {useState, useContext, useEffect, useCallback} from 'react';
import {IconButton, VStack, View} from 'native-base';
import {Dimensions, StyleSheet} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Header, LoadingScreen, P1Badge} from '@commonComponents';
import {ScreenBase, GridView} from '@Containers';
import {ToastProfiles} from '@ToastProfiles';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {getURL} from '@APIRepository';
import {getCartTotalCalculator, parseError} from '@helpers';
import P1Styles from '@P1StyleSheet';
import {useContextSelector} from 'use-context-selector';

const styles = StyleSheet.create({
  contentBase: {
    flex: 1,
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  contentContainerStyle: {
    width: '100%',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    backgroundColor: '#ffffff',
    gap: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: 4,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...P1Styles.shadow,
  },
});

const cardPropParser = (item: any) => item;

const ItemsListing = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'ItemsListing'>) => {
  const [renderData, setRenderData] = useState<{
    [key: string]: any;
    loaded: boolean;
  }>({
    loaded: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const {storeId} = useContext(AuthContext);
  const {APIGet} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);
  const {cart, handleAdd, handleSubtract} = useContextSelector(
    FormStateContext,
    state => ({
      cart: state.cart,
      updateCart: state.updateCart,
      handleAdd: state.handleAdd,
      handleSubtract: state.handleSubtract,
    }),
  );
  // Fetch data from the API
  const fetchRenderData = useCallback(
    async ({
      onCompleteCallback,
      isRefreshing,
    }: {
      onCompleteCallback?: Function;
      isRefreshing?: boolean;
    }) => {
      if (!isRefreshing) {
        setLoading(true);
        setRenderData(prev => ({...prev, loaded: false}));
      }

      try {
        const response = await APIGet({
          url: getURL({
            key: 'PRODUCTS_LISTING',
            queryParams: {
              [route.params.listBy]: route.params.type,
              ...(storeId ? {storeId} : {}),
            },
          }),
        });

        if (!response.data) {
          throw new Error('No data received');
        }

        setRenderData({
          ...response.data,
          items: (response.data?.products || []).map((item: any) => ({
            ...item,
            card_id: 'card_11',
          })),
          loaded: true,
        });
      } catch (error) {
        showToast({...ToastProfiles.error, title: parseError(error).message});
      } finally {
        setLoading(false);
        onCompleteCallback?.();
      }
    },
    [APIGet, route.params, storeId, showToast],
  );

  useEffect(() => {
    fetchRenderData({});
  }, [fetchRenderData]);

  const onRefresh = useCallback(
    (setRefreshing: Function) => {
      setRefreshing(true);
      fetchRenderData({
        onCompleteCallback: () => setRefreshing(false),
        isRefreshing: true,
      });
    },
    [fetchRenderData],
  );

  const renderCartIcon = useCallback(
    () => (
      <View position="relative">
        {cart.items.length > 0 && (
          <P1Badge style={styles.cartBadge}>{cart.items.length}</P1Badge>
        )}
        <IconButton
          onPress={() => navigation.push('Cart')}
          variant="unstyled"
          icon={
            <FontAwesomeIcon
              size={20}
              icon="cart-shopping"
              style={{color: '#FFFFFF'}}
            />
          }
        />
      </View>
    ),
    [cart.items.length, navigation],
  );

  return (
    <ScreenBase>
      <VStack h="100%" bgColor="#2E6ACF">
        <Header
          screenTitle={renderData.title || route.params.type || 'Products'}
          screenTitleLoadingPlaceholder="Products"
          loading={loading}
          controls={renderCartIcon()}
          textColor="#FFFFFF"
        />
        {loading ? (
          <LoadingScreen />
        ) : (
          <GridView
            style={styles.contentBase}
            contentContainerStyle={styles.contentContainerStyle}
            onRefresh={onRefresh}
            list={renderData.items || []}
            searchFilter={(keyword: string, item: any) =>
              new RegExp(`^${keyword}`, 'i').test(item.name)
            }
            cardPropParser={cardPropParser}
            controlProps={{
              onPress: (product: any) =>
                navigation.push('ItemDetails', {itemId: product.id}),
              getCounterValue: (product: any) =>
                cart.items.find((cartItem: any) => cartItem.id === product.id)
                  ?.qty || 0,
              add: (product: any) => handleAdd(product),
              subtract: (product: any) => handleSubtract(product),
            }}
          />
        )}
      </VStack>
    </ScreenBase>
  );
};

export default ItemsListing;
