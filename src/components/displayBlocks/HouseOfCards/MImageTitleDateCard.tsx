import React, {startTransition, useCallback, useContext} from 'react';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import P1Styles from '@P1StyleSheet';
import moment from 'moment';
import {HStack, Image, Text, VStack, View} from 'native-base';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {Counter} from '@commonComponents';
import {AuthContext, FormStateContext} from '@contextProviders';
import {useContextSelector} from 'use-context-selector';

const styles = StyleSheet.create({
  cardBase: {
    position: 'relative',
    borderRadius: 8,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#F4F8FF',
    overflow: 'hidden',
    // minWidth: 240,
    ...P1Styles.shadow,
  },
  backgroundImg: {
    position: 'absolute',
    width: 28,
    height: 28,
    opacity: 0.24,
    transform: [{scale: 1.2}],
  },
  img: {
    width: 224,
    height: 180,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    objectFit: 'contain',
  },
  fallbackImageStyle: {
    width: 220,
    height: 180,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    objectFit: 'contain',
    marginTop: 10,
    overflow: 'hidden',
  },
  textBlock: {
    position: 'absolute',
    bottom: 0,
    height: 'auto',
    width: '100%',
    padding: 15,
    paddingTop: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#ffffff',
    backgroundColor: '#a99d97dd',
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
    fontSize: 10,
    fontWeight: '600',
    color: '#2E3A59',
    textTransform: 'uppercase',
    backgroundColor: '#4ce1ff79',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginVertical: 4,
  },
  priceSection: {
    marginBottom: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  priceSymbol: {
    fontSize: 10,
    fontWeight: '400',
    color: '#0F1111',
  },
  priceWhole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22437c',
  },
  discount: {
    fontSize: 10,
    color: '#f4f4f4',
    fontWeight: '400',
    textAlign: 'center',
    padding: 4,
  },
});

const MImageTitleDateCard = (props: any) => {
  const mrp = props.mrp || props.price;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cart = useContextSelector(FormStateContext, state => state.cart);
  const {handleAdd, handleSubtract} = useContextSelector(
    FormStateContext,
    state => ({
      handleAdd: state.handleAdd,
      handleSubtract: state.handleSubtract,
    }),
  );

  // Merge default styles with passed styles
  const cardBaseStyle = StyleSheet.flatten([styles.cardBase, props.style]);
  const imgStyle = StyleSheet.flatten([styles.img, props.imageStyle]);
  const textBlockStyle = StyleSheet.flatten([
    styles.textBlock,
    props.textBlockStyle,
  ]);
  const labelStyle = StyleSheet.flatten([styles.label, props.labelStyle]);
  const packagingTextStyle = StyleSheet.flatten([
    styles.packagingText,
    props.packagingTextStyle,
  ]);
  const priceSectionStyle = StyleSheet.flatten([
    styles.priceSection,
    props.priceSectionStyle,
  ]);
  const dateLabelStyle = StyleSheet.flatten([
    styles.dateLabel,
    props.dateLabelStyle,
  ]);

  const fallbackImageStyle = StyleSheet.flatten([
    styles.fallbackImageStyle,
    props.fallbackImageStyle,
  ]);
  return (
    <TouchableOpacity
      onPress={() =>
        startTransition(() =>
          navigation.push('ItemDetails', {itemId: props.id}),
        )
      }>
      <VStack style={cardBaseStyle} height={props.orderedOn ? 348 : 324}>
        <Image
          src={props.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}
          alt={props.name}
          style={styles.backgroundImg}
          blurRadius={20}
        />
        <Image
          src={props.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}
          // src="https://assets.truemeds.in/Images/ProductImage/TM-TACR1-078605/dolo-650-mg-tablet-10_dolo-650-mg-tablet-10--TM-TACR1-078605_2.png?width=320"
          alt={props.name}
          style={
            props.imageUrl?.toString() !==
            TABLET_CAPSULE_IMAGE_FALLBACK.toString()
              ? imgStyle
              : fallbackImageStyle
          }
        />
        {props.discount ? (
          <View
            style={{
              backgroundColor: '#CC0C39',
              borderRadius: 35,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 10,
              top: 10,
            }}>
            {/* <Text style={styles.discount}>Save {discountPercentage}% off</Text> */}
          </View>
        ) : null}
        <VStack style={textBlockStyle}>
          <Text noOfLines={1} style={labelStyle}>
            {props.name}
          </Text>

          <HStack>
            <Text noOfLines={1} style={packagingTextStyle}>
              {props.packaging || `Top Pick Among Customers.`}
            </Text>
          </HStack>

          <View style={priceSectionStyle}>
            <HStack
              style={{justifyContent: 'center', alignItems: 'center', gap: 8}}>
              <Text style={styles.priceWhole}>M.R.P : ₹{mrp}</Text>
              {props.discount ? (
                // <Text style={styles.mrpText}> ₹{costPrice}</Text>
                <></>
              ) : null}
            </HStack>
          </View>

          <HStack justifyContent="space-between">
            {props.orderedOn && (
              <Text style={dateLabelStyle}>
                {`Ordered on: ${moment
                  .unix(props.orderedOn)
                  .format('DD-MMM-YYYY')}`}
              </Text>
            )}
          </HStack>
          <Counter
            containerStyle={{
              backgroundColor: '#2e6acf',
              borderWidth: 2,
              borderColor: '#ffffff',
              marginTop: 4,
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
            value={
              cart.items.find((cartItem: any) => cartItem.id === props.id)
                ?.qty || 0
            }
            zeroCounterLabel="Add to Cart "
            add={() => handleAdd(props)}
            subtract={() => handleSubtract(props)}
            labelColor="#F4F8FE"
            textSize={14}
            borderRadius={
              props.counterBorderRadius ? props.counterBorderRadius : 14
            }
          />
        </VStack>
      </VStack>
    </TouchableOpacity>
  );
};

export default MImageTitleDateCard;
