import React, {startTransition, useCallback, useContext} from 'react';
import {Divider, HStack, Image, Text, VStack, View} from 'native-base';
import {StyleSheet, TouchableOpacity} from 'react-native';
import P1Styles from '@P1StyleSheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Counter} from '@commonComponents';

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    width: '100%',
    padding: 4,
    maxHeight: 116,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: '35%',
    height: '100%',
    marginRight: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  detailsContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#0F1111',
    lineHeight: 20,
    // marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    color: '#007185',
    fontSize: 12,
    marginLeft: 4,
  },
  priceSection: {
    marginVertical: 4,
  },
  priceSymbol: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F1111',
    lineHeight: 16,
  },
  priceWhole: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0F1111',
    lineHeight: 27,
  },
  mrpText: {
    fontSize: 12,
    color: '#565959',
    textDecorationLine: 'line-through',
    marginVertical: 4,
  },
  discount: {
    fontSize: 12,
    color: '#CC0C39',
    fontWeight: '500',
  },
  deliveryText: {
    fontSize: 12,
    color: '#565959',
    marginTop: 4,
  },
  addToCartSection: {
    marginTop: 0,
  },
  counterContainer: {
    backgroundColor: '#2E6ACF',
    height: 36,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 350,
  },
});

const MProductCounterCard = ({
  item,
  controlProps,
}: {
  item: {
    id: string;
    name: string;
    price: number; // MRP
    ptr: number; // Price to Retailer
    imageUrl: string;
    discount?: number; // Optional discount percentage
  };
  controlProps: {
    onPress: Function;
    getCounterValue: Function;
    add: Function;
    subtract: Function;
  };
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // const normalizeCartItem = (cartItem: any) => ({
  //   id: cartItem.id,
  //   card_id: cartItem.card_id || null,
  //   gst: cartItem.gst || null,
  //   imageUrl: cartItem.imageUrl || null,
  //   name: cartItem.name || null,
  //   price: cartItem.price || cartItem.mrp || 0,
  //   ptr: cartItem.ptr || 0,
  //   qty: cartItem.qty || 0,
  // });

  const mrp = item.price;
  // const costPrice = calculateSellingPrice(mrp);
  // const discountPercentage = Math.round(((costPrice - mrp) / mrp) * 100);

  return (
    <>
      <TouchableOpacity
        onPress={() =>
          startTransition(() =>
            navigation.navigate('ItemDetails', {itemId: item.id}),
          )
        }
        activeOpacity={0.7}
        style={styles.cardContainer}>
        <View style={styles.contentRow}>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: item.imageUrl}}
              alt={item.name}
              style={styles.image}
            />
          </View>

          <VStack style={styles.detailsContainer}>
            <Text numberOfLines={2} style={styles.title}>
              {item.name}
            </Text>

            <View style={styles.priceSection}>
              <HStack alignItems="center" marginRight={4}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceWhole}>{mrp}</Text>
              </HStack>

              {item.discount ? (
                <>
                  {/* <Text style={styles.mrpText}>M.R.P.: ₹{costPrice}</Text>
                  <Text style={styles.discount}>
                    Save {discountPercentage}% off
                  </Text> */}
                </>
              ) : null}
            </View>

            <View style={styles.addToCartSection}>
              <Counter
                containerStyle={styles.counterContainer}
                value={controlProps.getCounterValue(item)}
                zeroCounterLabel="Add to Cart"
                add={() => controlProps.add(item)}
                subtract={() => controlProps.subtract(item)}
                labelColor="#fdfdfd"
                textSize={14}
                borderRadius={10}
              />
            </View>
          </VStack>
        </View>
      </TouchableOpacity>
      <Divider
        style={{
          height: 1,
          marginVertical: 2,
        }}></Divider>
    </>
  );
};

export default MProductCounterCard;
