import React from 'react';
import {ScrollView, VStack, HStack} from 'native-base';
import {StyleSheet, ViewStyle, Text, Dimensions, Platform} from 'react-native';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth > screenHeight;const styles = StyleSheet.create({
  sectionBase: {
    marginHorizontal: 10,
    paddingVertical: 5,
    marginBottom: isDesktop ? 16 : 8,
    backgroundColor: '#FFFFFF',
  },
  itemStyle: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 5,
    marginRight: 5,
    marginBottom: 2,
  },
  row: {
    marginBottom: 0, // Space between rows
    marginTop: 0,
  },
});

type VerticalSectionProps = {
  children: React.ReactNode;
  sectionBaseStyle?: ViewStyle;
};

const VerticalScrollableSection: React.FC<VerticalSectionProps> = (
  props: any,
) => {
  const {children, sectionBaseStyle} = props;
  const childrenArray = React.Children.toArray(children);
  const mid = Math.ceil(childrenArray.length / 2);
  const chunkedItems = [childrenArray.slice(0, mid), childrenArray.slice(mid)];

  return (
    <VStack style={{...styles.sectionBase, ...(sectionBaseStyle || {})}}>
      <Text style={{fontWeight: '600', fontSize: props.fontSize !== undefined ? props.fontSize : 20, paddingVertical: 4}}>
        {props.content.title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <VStack>
          {chunkedItems.map((chunk, index) => (
            <HStack key={index} style={styles.row}>
              {chunk.map((child, childIndex) => (
                <VStack key={childIndex} style={[styles.itemStyle]}>
                  {child}
                </VStack>
              ))}
            </HStack>
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default VerticalScrollableSection;
