import {startTransition, useCallback, useContext} from 'react';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import P1Styles from '@P1StyleSheet';
import moment from 'moment';
import {HStack, Image, Text, VStack, View} from 'native-base';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {getCartTotalCalculator} from '@helpers';
import {Counter} from '@commonComponents';
import {AuthContext, FormStateContext} from '@contextProviders';
import { useContextSelector } from 'use-context-selector';
import React from 'react';

const styles = StyleSheet.create({
  cardBase: {
    position: 'relative',
    borderRadius: 10,
    marginHorizontal: 0,
    width: 270,
    height: 350,
    alignItems: 'center',
    backgroundColor: '#F4F8FF',
    overflow: 'hidden',
    minWidth: 240,
    ...P1Styles.shadow,
  },
  backgroundImg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
    transform: [{scale: 1.2}],
  },
  img: {
    width: '80%',
    marginTop: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    objectFit: 'contain',
    maxHeight: 180,
    maxWidth: 250,
  },
  textBlock: {
    position: 'absolute',
    bottom: 0,
    // height: 'auto',
    width: '100%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    ...P1Styles.shadow,
    minHeight: 150,
    // backgroundColor:'red'
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E3A59',
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#ffffff',
    backgroundColor: '#8A94A6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginBottom: 8,
  },
  priceContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mrpText: {
    fontSize: 12,
    color: '#565959',
    textDecorationLine: 'line-through',
    marginVertical: 4,
  },
  ptrText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#8A94A6',
  },
  packaging: {
    backgroundColor: '#4cdbff7e',
  },
  packagingText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#2E3A59',
    textTransform: 'uppercase',
    backgroundColor: '#4cdbff58',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginVertical: 4,
  },
  priceSection: {
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  priceSymbol: {
    fontSize: 10,
    fontWeight: '400',
    color: '#0F1111',
  },
  priceWhole: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F1111',

    // marginBottom: 8,
  },
  discount: {
    fontSize: 10,
    color: '#CC0C39',
    fontWeight: '400',
    // marginTop: 4,
  },
});

const normalizeCartItem = (cartItem: any) => {
  return {
    id: cartItem.id,
    card_id: cartItem.card_id || null,
    gst: cartItem.gst || null,
    imageUrl: cartItem.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK,
    name: cartItem.name || null,
    price: cartItem.price || cartItem.mrp || 0, // Make sure price is picked correctly
    ptr: cartItem.ptr || 0,
    qty: cartItem.qty || 0,
  };
};
const calculateSellingPrice = (mrp: number) => {
  let baseDiscount = 0;
  if (mrp <= 500) {
    baseDiscount = 10;
  } else if (mrp <= 1000) {
    baseDiscount = 15;
  } else if (mrp <= 2000) {
    baseDiscount = 20;
  } else {
    baseDiscount = 25;
  }

  const variation = Math.random() * 4 - 2;
  const finalDiscountPercentage = baseDiscount + variation;

  const discountAmount = (mrp * finalDiscountPercentage) / 100;
  const costPrice = mrp + discountAmount;

  return Math.floor(costPrice / 10) * 10 + 9;
};
const ImageTitleDateCard = (props: any) => {
  const mrp = props.mrp || props.price;

  const costPrice = calculateSellingPrice(mrp);
  const discountPercentage = Math.round(((costPrice - mrp) / mrp) * 100);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {appMode} = useContext(AuthContext);
  const cartTotalCalculator = getCartTotalCalculator(appMode as string);
  const cart = useContextSelector(FormStateContext, state => state.cart);
  const updateCart = useContextSelector(FormStateContext, state => state.updateCart);

  const manipulateItemQuantity = useCallback(
    (item: any, operation: '+' | '-') => {
      const normalizedItem = normalizeCartItem(item);

      if (operation === '+') {
        if (
          !cart.items.find((cartItem: any) => cartItem.id === normalizedItem.id)
        ) {
          const cartItems = [...cart.items, {...normalizedItem, qty: 1}];
          updateCart({
            items: cartItems,
            totalAmount: cartTotalCalculator(cartItems),
          });
        } else {
          const cartItems = [...cart.items];

          const itemIndex = cartItems.findIndex(
            (cartItem: any) => cartItem.id === normalizedItem.id,
          );

          cartItems[itemIndex].qty += 1;

          updateCart({
            items: cartItems,
            totalAmount: cartTotalCalculator(cartItems),
          });
        }
      } else {
        const cartItems = [...cart.items];

        const itemIndex = cartItems.findIndex(
          (cartItem: any) => cartItem.id === normalizedItem.id,
        );

        if (cartItems[itemIndex].qty === 1) {
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].qty -= 1;
        }

        updateCart({
          items: cartItems,
          totalAmount: cartTotalCalculator(cartItems),
        });
      }
    },
    [cart, updateCart, cartTotalCalculator],
  );
  return (
    <TouchableOpacity
      onPress={() =>
        startTransition(() =>
          navigation.push('ItemDetails', {itemId: props.id}),
        )
      }>
      <VStack style={styles.cardBase} height={props.orderedOn ? 390 : 350}>
        <Image
          src={props.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}
          alt={props.name}
          style={styles.backgroundImg}
          blurRadius={20}
        />
        <Image
          src={props.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}
          alt={props.name}
          style={{...styles.img, height: props.orderedOn ? '50%' : '70%'}}
        />
        <VStack style={styles.textBlock}>
          <Text noOfLines={1} style={styles.label}>
            {props.name}
          </Text>

          <HStack>
            <Text noOfLines={1} style={styles.packagingText}>
              {props.packaging || 'Offer Ending Soon !!!'}
            </Text>
          </HStack>

          <View style={styles.priceSection}>
            <HStack style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.priceWhole}>₹{mrp}</Text>
            </HStack>
            {props.discount ? (
              <View>
                <Text style={styles.mrpText}>M.R.P.: ₹{costPrice}</Text>
                <Text style={styles.discount}>
                  Save {discountPercentage}% off
                </Text>
              </View>
            ) : null}
          </View>

          <HStack justifyContent="space-between">
            {props.orderedOn && (
              <Text style={styles.dateLabel}>
                {`Ordered on: ${moment
                  .unix(props.orderedOn)
                  .format('DD-MMM-YYYY')}`}
              </Text>
            )}
          </HStack>
          <Counter
            containerStyle={{
              backgroundColor: '#2E6ACF',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#2E6ACF',
              marginTop: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            value={
              cart.items.find((cartItem: any) => cartItem.id === props.id)
                ?.qty || 0
            }
            zeroCounterLabel="Add to Cart "
            add={() => manipulateItemQuantity(props, '+')}
            subtract={() => manipulateItemQuantity(props, '-')}
            labelColor="#FFFFFF"
            textSize={14}
          />
        </VStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default ImageTitleDateCard;
