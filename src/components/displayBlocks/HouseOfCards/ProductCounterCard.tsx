import {startTransition, useCallback, useContext} from 'react';
import {HStack, Image, Text, VStack, View} from 'native-base';
import {StyleSheet, TouchableOpacity} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {AuthContext, FormStateContext} from '@contextProviders';
import {getCartTotalCalculator} from '@helpers';
import {Counter} from '@commonComponents';
import { useContextSelector } from 'use-context-selector';
import React from 'react';

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#3a7ff622',
    marginBottom: 12,
    borderRadius: 12,
    width: 320,
    height: 340,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
    ...P1Styles.shadow,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  imageContainer: {
    width: '90%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '100%',
    objectFit: 'cover', // Changed to 'cover' for better image display
  },
  detailsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    maxHeight: 200,
    paddingTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600', // Increased font weight for better readability
    color: '#0F1111',
    marginBottom: 6,
    maxWidth: 280,
  },
  priceSection: {
    marginBottom: 8,
    alignItems: 'center',
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '400',
    color: '#0F1111',
  },
  priceWhole: {
    fontSize: 16,
    fontWeight: '700', // Increased font weight for emphasis
    color: '#0F1111',
  },
  mrpText: {
    fontSize: 12,
    color: '#565959',
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 12,
    color: '#CC0C39',
    fontWeight: '500', // Increased font weight for better visibility
  },
  addToCartSection: {
    width: '100%',
    position: 'absolute',
    bottom: 5,
  },
  counterContainer: {
    backgroundColor: '#2E6ACF',
    borderRadius: 8,
    width: 270,
    flexDirection: 'row',
  },
});

const ProductCard = ({
  item,
}: {
  item: {
    id: string;
    name: string;
    price: number; // MRP
    ptr: number; // Price to Retailer
    imageUrl: string;
    discount?: number; // Optional discount percentage
  };
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {appMode} = useContext(AuthContext);
  const cartTotalCalculator = getCartTotalCalculator(appMode as string);
  const {cart, updateCart} = useContextSelector(FormStateContext, state => ({
    cart: state.cart,
    updateCart: state.updateCart
  }));

  const normalizeCartItem = (cartItem: any) => ({
    id: cartItem.id,
    card_id: cartItem.card_id || null,
    gst: cartItem.gst || null,
    imageUrl: cartItem.imageUrl || null,
    name: cartItem.name || null,
    price: cartItem.price || 0,
    ptr: cartItem.ptr || 0,
    qty: cartItem.qty || 0,
  });

  const manipulateItemQuantity = useCallback(
    (item: any, operation: '+' | '-') => {
      const cartItems = [...cart.items];
      const itemIndex = cartItems.findIndex(
        cartItem => cartItem.id === item.id,
      );

      if (operation === '+') {
        if (itemIndex === -1) {
          cartItems.push(normalizeCartItem({...item, qty: 1}));
        } else {
          cartItems[itemIndex].qty += 1;
        }
      } else if (operation === '-' && itemIndex !== -1) {
        if (cartItems[itemIndex].qty === 1) {
          cartItems.splice(itemIndex, 1);
        } else {
          cartItems[itemIndex].qty -= 1;
        }
      }

      updateCart({
        items: cartItems,
        totalAmount: cartTotalCalculator(cartItems),
      });
    },
    [cart, updateCart, cartTotalCalculator],
  );

  const mrp = item.price;
  const sellingPrice = item.discount ? mrp - (mrp * item.discount) / 100 : mrp;

  return (
    <TouchableOpacity
      onPress={() =>
        startTransition(() =>
          navigation.navigate('ItemDetails', {itemId: item.id}),
        )
      }
      activeOpacity={0.7}
      style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{uri: item.imageUrl}}
          alt={item.name}
          style={styles.image}
        />
      </View>

      <VStack style={styles.detailsContainer}>
        <Text numberOfLines={1} style={styles.title}>
          {item.name}
        </Text>

        <View style={styles.priceSection}>
          <HStack alignItems="center">
            <Text style={styles.priceSymbol}>M.R.P : ₹</Text>
            <Text style={styles.priceWhole}>{sellingPrice}</Text>
          </HStack>

          {item.discount && (
            <>
              <Text style={styles.mrpText}> ₹{mrp}</Text>
              <Text style={styles.discount}>Save {item.discount}% off</Text>
            </>
          )}
        </View>

        <Counter
          containerStyle={styles.counterContainer}
          value={
            cart.items.find((cartItem: any) => cartItem.id === item.id)?.qty ||
            0
          }
          zeroCounterLabel="Add to Cart"
          add={() => manipulateItemQuantity(item, '+')}
          subtract={() => manipulateItemQuantity(item, '-')}
          labelColor="#fdfdfd"
          textSize={16}
          borderRadius={8}
        />
      </VStack>
    </TouchableOpacity>
  );
};

export default ProductCard;
