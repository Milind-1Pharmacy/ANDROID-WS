import P1Styles from '@P1StyleSheet';
import {Text, View} from 'native-base';
import {StyleSheet} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  cardBase: {
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    ...P1Styles.shadow,
  },
  displayItem: {
    flexDirection: 'row',
  },
  keyBaseStyle: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  valueBaseStyle: {
    flex: 1,
    flexWrap: 'wrap',
  },
});

const KeyValDescCard = (props: any) => {
  const {displayData} = props.item;

  return (
    <View style={styles.cardBase}>
      {(displayData.title || displayData.subtitle) && (
        <View style={styles.titleBlock}>
          <View>
            {displayData.title && (
              <Text style={styles.title}>{displayData.title}</Text>
            )}
            {displayData.subtitle && (
              <Text style={styles.subtitle}>{displayData.subtitle}</Text>
            )}
          </View>
        </View>
      )}
      {(displayData || []).map((dataItem: any) => (
        <View
          style={styles.displayItem}
          key={dataItem.key.text + dataItem.value.text}>
          <Text
            style={{...styles.keyBaseStyle, ...(dataItem.key.styles || {})}}>
            {dataItem.key.text}
          </Text>
          <Text
            style={{
              ...styles.valueBaseStyle,
              ...(dataItem.value.styles || {}),
            }}>
            {dataItem.value.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default KeyValDescCard;
