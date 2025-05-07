import {getURL} from '@APIRepository';
import React from 'react';
import {ToastProfiles} from '@ToastProfiles';
import {
  APIContext,
  AuthContext,
  FormStateContext,
  ToastContext,
} from '@contextProviders';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {
  Divider,
  HStack,
  IconButton,
  Image,
  ScrollView,
  Text,
  View,
} from 'native-base';
import {
  startTransition,
  useState,
  useEffect,
  useContext,
  useRef,
  memo,
  useCallback,
} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LoadingScreen from '../commonComponents/LoadingScreen';
import HorizontalScrollableSection from '../displayBlocks/Containers/HorizontalScrollableSection';
import Counter from '../commonComponents/Counter';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import P1Badge from '../commonComponents/P1Badge';
import {parseError} from '@helpers';
import {useFocusEffect} from '@react-navigation/native';
import {useContextSelector} from 'use-context-selector';
import {getCardByIndex} from '@HouseOfCards';

const card_type = 'product_image_title_date';
const CardComponent = getCardByIndex(card_type);

const mobileStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D3DCE6',
  },
  headerButton: {
    backgroundColor: 'transparent',
  },
  icon: {
    color: '#2E6ACF',
    height: 20,
    width: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B50',
  },
  headerIcons: {
    columnGap: 0,
  },
  scrollView: {
    backgroundColor: '#F5F7FA',
  },
  scrollViewContent: {
    backgroundColor: '#F5F7FA',
    opacity: 0.9,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '92%',
    marginHorizontal: 'auto',
    borderRadius: 32,
    elevation: 3,
    height: 'auto',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 16,
    marginBottom: 4,
    maxHeight: 520,
  },
  productImage: {
    width: '100%',
    borderRadius: 32,
    marginHorizontal: 8,
    resizeMode: 'cover',
    maxHeight: 300,
  },
  itemDetails: {
    padding: 12,
    width: '100%',
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A2B50',
    lineHeight: 28,
    textAlign: 'left',
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '400',
    color: '#F4A261',
    marginTop: 6,
  },
  description: {
    color: '#778899',
    fontSize: 16,
  },
  manufacture: {
    color: '#778899',
    fontSize: 16,
    marginTop: 10,
  },
  similarItemsContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 2,

    maxWidth: '100%',
    marginBottom: 32,
    backgroundColor: 'rgba(176, 196, 222, 0.294)',
    width: '100%',
  },
  mainCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 4,
    backgroundColor: '#2e6acf',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
    marginBottom: 16,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 220,
  },
  counterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexWrap: 'wrap',
    width: 120,
    gap: 8,
  },
});

const ItemDetailsView = memo(
  ({
    renderData,
    navigation,
    safeAreaInsets,
  }: {
    renderData: any;
    navigation: any;
    safeAreaInsets: any;
  }) => {
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const cart = useContextSelector(FormStateContext, state => state.cart);
    const {handleAdd, handleSubtract} = useContextSelector(
      FormStateContext,
      state => ({
        handleAdd: state.handleAdd,
        handleSubtract: state.handleSubtract,
      }),
    );
    const scrollViewRef = useRef<typeof ScrollView | null>(null);

    useEffect(() => {
      if (renderData.imageUrl) {
        (Image.getSize as any)(
          renderData.imageUrl,
          (width: number, height: number) => {
            const screenWidth = Dimensions.get('window').width;
            const aspectRatio = height / width;
            setImageHeight(screenWidth * aspectRatio - 64);
          },
          (error: any) => {
            console.error('Error loading image:', error);
          },
        );
      }
    }, [renderData.imageUrl]);

    useEffect(() => {
      if (scrollViewRef?.current) {
        (scrollViewRef.current as any)?.scrollTo({x: 0, y: 0, animated: true});
      }
    }, [renderData.id]);

    return (
      <View style={mobileStyle.container}>
        <HStack
          px={1}
          py={2}
          style={[mobileStyle.header, {top: safeAreaInsets.top}]}>
          <HStack
            alignItems="center"
            style={{backgroundColor: '#EFEFEF', borderRadius: 35}}>
            <IconButton
              variant="solid"
              style={mobileStyle.headerButton}
              icon={
                <FontAwesomeIcon
                  icon="arrow-left"
                  style={mobileStyle.icon}
                  size={20}
                  color="#2e6acf"
                />
              }
              onPress={navigation.goBack}
            />
          </HStack>
          <Text style={mobileStyle.headerTitle}>Item Details</Text>
          <HStack style={mobileStyle.headerIcons}>
            <IconButton
              onPress={() => {
                navigation.push('Search', {
                  searchItem: renderData.name,
                });
              }}
              variant="solid"
              style={mobileStyle.headerButton}
              icon={
                <FontAwesomeIcon
                  icon="magnifying-glass"
                  style={mobileStyle.icon}
                  size={20}
                  color="#2e6acf"
                />
              }
            />
            <View position="relative">
              {cart.items.length > 0 && (
                <P1Badge
                  style={{
                    height: 18,
                    width: 18,
                    borderRadius: 8,
                    position: 'absolute',
                    top: 0,
                    right: 4,
                  }}>
                  {cart.items.length}
                </P1Badge>
              )}
              <IconButton
                onPress={() =>
                  startTransition(() => navigation.navigate('Cart'))
                }
                variant="solid"
                style={mobileStyle.headerButton}
                icon={
                  <FontAwesomeIcon
                    icon="cart-shopping"
                    style={mobileStyle.icon}
                    size={22}
                    color="#2e6acf"
                  />
                }
              />
            </View>
          </HStack>
        </HStack>

        <ScrollView
          style={mobileStyle.scrollView}
          contentContainerStyle={mobileStyle.scrollViewContent}
          ref={scrollViewRef}>
          <View style={mobileStyle.contentContainer}>
            <View style={mobileStyle.productCard}>
              <Image
                source={{uri: renderData.imageUrl}}
                alt={renderData.name}
                style={[
                  mobileStyle.productImage,
                  {height: imageHeight, backgroundColor: 'transparent'},
                ]}
              />
              <View style={mobileStyle.itemDetails}>
                <Text style={mobileStyle.label} noOfLines={2}>
                  {renderData.name}
                </Text>
                <Text style={mobileStyle.priceTag}>
                  MRP : ₹{renderData.price}
                </Text>
                <Divider orientation="horizontal" height={0.9} my={2} />
                <Text style={mobileStyle.description}>
                  {renderData.description}
                </Text>
                {renderData.manufacture && (
                  <Text style={mobileStyle.manufacture}>
                    Manufactured by: {renderData.manufacture}
                  </Text>
                )}
              </View>
              <View style={mobileStyle.mainCounter}>
                <View style={{flex: 1, backgroundColor: 'transparent'}}>
                  {cart.items.find(
                    (cartItem: any) => cartItem?.id === renderData.id,
                  )?.qty > 0 ? (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#ffffff',
                      }}>
                      Item Total: ₹
                      {(
                        renderData.price *
                        (cart.items.find(
                          (cartItem: any) => cartItem.id === renderData.id,
                        )?.qty || 0)
                      ).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#fff',
                        fontWeight: '500',
                        textAlign: 'left',
                      }}>
                      Get it before it's gone!
                    </Text>
                  )}
                </View>
                <Counter
                  value={
                    cart.items.find(
                      (cartItem: any) => cartItem.id === renderData.id,
                    )?.qty || 0
                  }
                  zeroCounterLabel={
                    <Text
                      fontSize={12}
                      color={'#2e6acf'}
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      Add to Cart
                    </Text>
                  }
                  add={() => handleAdd(renderData)}
                  subtract={() => handleSubtract(renderData)}
                  containerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#f1f1f1',
                    borderRadius: 16,
                    minWidth: 100,
                    justifyContent: 'space-between',
                  }}
                  labelColor="#2E6ACF"
                  textSize={14}
                  showPlusIcon={true}
                  borderRadius={8}
                  buttonPadding={2}
                />
              </View>
            </View>
            {renderData.similarProduct?.length > 0 && (
              <HorizontalScrollableSection
                sectionBaseStyle={mobileStyle.similarItemsContainer}
                containerStyle={{
                  paddingTop: 8,
                  overflow: 'scroll',
                  borderRadius: 8,
                  paddingLeft: 0,
                  gap: 16,
                  color: 'white',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
                content={{title: 'You Might Love These Too!'}}
                fontSize={16}
                fontWeight={'800'}
                color="#36454F">
                {renderData.similarProduct.map(
                  (product: any, index: number) => (
                    <CardComponent
                      key={product.id + index}
                      style={{width: 200, height: 250}}
                      imageStyle={{
                        width: '96%',
                        height: 100,
                        objectFit: 'contain',
                        marginBottom: 12,
                        background: 'transparent',
                      }}
                      fallbackImageStyle={{
                        width: 100,
                        height: 100,
                        objectFit: 'contain',
                        marginBottom: 12,
                      }}
                      textBlockStyle={{padding: 10}}
                      labelStyle={{fontSize: 14}}
                      packagingTextStyle={{fontSize: 8}}
                      priceSectionStyle={{marginBottom: 2}}
                      dateLabelStyle={{fontSize: 8}}
                      counterBorderRadius={8}
                      {...product}
                    />
                  ),
                )}
                {/* <CardComponent
                  key={renderData.similarProduct[0].id}
                  {...renderData.similarProduct[0]}
                  style={{width: 200, height: 240}}
                  imageStyle={{width: 80, height: 120}}
                  textBlockStyle={{padding: 10}}
                  labelStyle={{fontSize: 14}}
                  packagingTextStyle={{fontSize: 8}}
                  priceSectionStyle={{marginBottom: 2}}
                  dateLabelStyle={{fontSize: 8}}
                /> */}
              </HorizontalScrollableSection>
            )}
          </View>
        </ScrollView>
      </View>
    );
  },
);

const ItemDetails = (
  props: NativeStackScreenProps<RootStackParamList, 'ItemDetails'>,
) => {
  const [loading, setLoading] = useState(true);
  const [renderData, setRenderData] = useState<any>({});
  const safeAreaInsets = useSafeAreaInsets();

  const {storeId} = useContext(AuthContext);
  const {APIGet} = useContext(APIContext);
  const {showToast} = useContext(ToastContext);

  const fetchRenderData = useCallback(() => {
    APIGet({
      url: getURL({
        key: 'PRODUCT_DETAILS',
        pathParams: props.route.params.itemId,
        queryParams: storeId ? {storeId} : {},
      }),
      resolve: (response: any) => {
        if (response.statusCode !== 200) {
          throw response;
        }

        setRenderData({
          ...(response.data || []),
          id: props.route.params.itemId,
        });
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
  }, [props.route.params.itemId, storeId, APIGet, showToast]);

  useFocusEffect(
    useCallback(() => {
      fetchRenderData();
    }, [fetchRenderData]),
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ItemDetailsView
      renderData={renderData}
      navigation={props.navigation}
      safeAreaInsets={safeAreaInsets}
    />
  );
};

export default memo(ItemDetails);
