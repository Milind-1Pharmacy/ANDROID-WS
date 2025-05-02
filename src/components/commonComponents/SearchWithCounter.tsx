import {useContext, useCallback, useMemo, memo, startTransition} from 'react';
import {CloudSearch, Counter} from '@commonComponents';
import {HStack, Image, Text, VStack} from 'native-base';
import {RUPEE_SYMBOL} from '@Constants';
import {FormStateContext} from '@contextProviders';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Dimensions} from 'react-native';
import {useContextSelector} from 'use-context-selector';
import React from 'react';

type ItemType = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  gst?: number;
  ptr?: number;
};

const ItemComponent = memo(
  ({
    index,
    item,
    qty,
    onAdd,
    onSubtract,
    isDesktop,
    width,
    navigation,
  }: {
    index: any;
    item: ItemType;
    qty: number;
    onAdd: (item: ItemType) => void;
    onSubtract: (item: ItemType) => void;
    isDesktop: boolean;
    width: number;
    navigation: any;
  }) => {
    const imageSource = useMemo(() => ({uri: item.imageUrl}), [item.imageUrl]);
    const formattedPrice = useMemo(
      () =>
        (item.price ?? 0).toLocaleString('en-US', {maximumFractionDigits: 2}),
      [item.price],
    );
    return (
      <HStack
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={3}
        borderBottomWidth={1}
        boxSize="border-box"
        borderColor="#E0E0E0">
        <TouchableOpacity
          style={{
            width: isDesktop ? width * 0.4 : width * 0.6,
            overflow: 'hidden',
          }}
          onPress={() =>
            startTransition(() =>
              navigation.navigate('ItemDetails', {itemId: item.id}),
            )
          }>
          <HStack space={2} alignItems="center" maxWidth={550}>
            <Image
              source={{uri: item?.imageUrl}}
              alt={item.name}
              style={{
                height: 40,
                width: 40,
                borderRadius: 10,
                objectFit: 'contain',
              }}
            />
            <VStack width="85%" maxWidth="85%">
              <Text style={{maxWidth: '90%'}} fontSize="sm" bold noOfLines={1}>
                {item.name}
              </Text>
              <Text color="gray.500" fontSize={13}>
                {`MRP: ${RUPEE_SYMBOL}${formattedPrice}`}
              </Text>
            </VStack>
          </HStack>
        </TouchableOpacity>
        <Counter
          value={qty}
          zeroCounterLabel={
            <Text
              fontSize={12}
              color={'#FFFFFF'}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              Add to Cart
            </Text>
          }
          add={() => onAdd(item)}
          subtract={() => onSubtract(item)}
          containerStyle={{
            width: isDesktop ? 120 : 112,
            // borderRadius: 8,
            justifyContent: 'space-between',
            backgroundColor: '#2E6ACF',
          }}
          buttonPadding={2}
          textSize={14}
          labelColor="white"
          borderRadius={16}
        />
      </HStack>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.qty === nextProps.qty &&
    prevProps.isDesktop === nextProps.isDesktop,
);

const SearchWithCounter = (props: any) => {
  const cart = useContextSelector(FormStateContext, state => state.cart);
  const handleAdd = useContextSelector(
    FormStateContext,
    state => state.handleAdd,
  );
  const handleSubtract = useContextSelector(
    FormStateContext,
    state => state.handleSubtract,
  );
  const {width} = Dimensions.get('screen');
  const isDesktop = width > 600;

  const renderItem = useCallback(
    (item: any, index: number) => {
      const qty =
        cart.items.find((cartItem: any) => cartItem.id === item.id)?.qty || 0;
      return (
        <ItemComponent
          index={item.id}
          key={item.id}
          item={item}
          qty={qty}
          onAdd={handleAdd}
          onSubtract={handleSubtract}
          isDesktop={isDesktop}
          width={width}
          navigation={props.navigation}
        />
      );
    },
    [cart, handleAdd, handleSubtract, isDesktop, width],
  );

  return (
    <CloudSearch
      navigation={props.navigation}
      placeholder={props.placeholder}
      searchURLGenerator={props.searchURLGenerator}
      itemsParser={props.itemsParser}
      initialSearchItem={props.initialSearchItem}
      renderItem={renderItem}
    />
  );
};

export default SearchWithCounter;
