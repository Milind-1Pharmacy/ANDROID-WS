import {useCallback, useMemo, memo, startTransition} from 'react';
import {CloudSearch, Counter} from '@commonComponents';
import {HStack, Image, Text, VStack} from 'native-base';
import {RUPEE_SYMBOL} from '@Constants';
import {useContextSelector} from 'use-context-selector';
import {FormStateContext} from '@contextProviders';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Dimensions} from 'react-native';
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
    item,
    qty,
    onAdd,
    onSubtract,
    navigation,
  }: {
    item: ItemType;
    qty: number;
    onAdd: (item: ItemType) => void;
    onSubtract: (item: ItemType) => void;
    navigation: any;
  }) => {
    const formattedPrice = useMemo(
      () =>
        (item.price ?? 0).toLocaleString('en-US', {maximumFractionDigits: 2}),
      [item.price],
    );

    return (
      <HStack
        id={item.id}
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={3}
        borderBottomWidth={1}
        boxSize="border-box"
        borderColor="#E0E0E0">
        <TouchableOpacity
          style={{
            width: '84%',
            overflow: 'hidden',
          }}
          onPress={() => {
            startTransition(() =>
              navigation.navigate('ItemDetails', {itemId: item.id}),
            );
          }}>
          <HStack space={2} alignItems="center">
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
            <VStack width="75%" maxWidth="75%">
              <Text style={{maxWidth: '95%'}} fontSize="sm" bold noOfLines={1}>
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
            width: 100,
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
    prevProps.item.id === nextProps.item.id && prevProps.qty === nextProps.qty,
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

  const renderItem = useCallback(
    (item: any) => {
      const qty =
        cart.items.find((cartItem: any) => cartItem.id === item.id)?.qty || 0;
      return (
        <ItemComponent
          key={item.id}
          item={item}
          qty={qty}
          onAdd={handleAdd}
          onSubtract={handleSubtract}
          navigation={props.navigation}
        />
      );
    },
    [cart, handleAdd, handleSubtract, props.navigation],
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
