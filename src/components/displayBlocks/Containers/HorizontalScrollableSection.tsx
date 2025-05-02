import React, {useState, useEffect, useRef} from 'react';
import {HStack, ScrollView, Text, VStack, Skeleton} from 'native-base';
import {Dimensions, Platform, StyleSheet, Animated, TextStyle} from 'react-native';


const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && screenWidth > screenHeight;

const styles = StyleSheet.create({
  sectionBase: {
    marginHorizontal: isDesktop ? 0 : 8,
    borderRadius: 4,
    paddingVertical: isDesktop ? 4 : 0,
    height: 'auto',
    overflow: 'hidden',
    paddingHorizontal: 8,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    marginBottom: 8,
  },
  titleText: {
    fontWeight: '600',
    fontSize: 20,
  },
  scrollView: {
    paddingStart: isDesktop ? 5 : 0,
  },
  cardContainer: {
    marginBottom: 4,
  },
  skeleton: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
});

interface HorizontalScrollableSectionProps {
  content?: {
    title?: string;
  };
  sectionBaseStyle?: any;
  containerStyle?: any;
  fontSize?: number;
  children?: React.ReactNode;
  fontWeight?: string;
  isLoading?: boolean;
  color?: string;
}

const HorizontalScrollableSection: React.FC<
  HorizontalScrollableSectionProps
> = ({
  content = {title: ''},
  sectionBaseStyle,
  containerStyle,
  fontSize,
  children,
  fontWeight,
  isLoading = false,
  color = '#3C3C3C',
}) => {
  const [sortedChildren, setSortedChildren] = useState<React.ReactNode[]>(
    children ? React.Children.toArray(children) : [],
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (content?.title === 'Previously Ordered Items' && children) {
      const sorted = React.Children.toArray(children).sort((a: any, b: any) => {
        const aOrderedOn = a.props?.children.props?.orderedOn || 0;
        const bOrderedOn = b.props?.children.props?.orderedOn || 0;
        return bOrderedOn - aOrderedOn;
      });
      setSortedChildren(sorted);
    } else {
      setSortedChildren(children ? React.Children.toArray(children) : []);
    }
  }, []);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isLoading ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isLoading]);

  const renderCards = () => {
    if (isLoading) {
      return (
        <>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} style={styles.skeleton} />
          ))}
        </>
      );
    } else {
      return sortedChildren.map((child: any, index: number) => (
        <Animated.View
          key={index}
          style={[
            styles.cardContainer,
            {opacity: fadeAnim, transform: [{scale: fadeAnim}]},
          ]}>
          {child}
        </Animated.View>
      ));
    }
  };

  return (
    <VStack
      style={
        sectionBaseStyle !== undefined ? sectionBaseStyle : styles.sectionBase
      }>
      <HStack style={styles.titleContainer}>
        <Text
          style={[styles.titleText, {fontSize: fontSize, fontWeight: fontWeight as TextStyle['fontWeight']}]}
          color={color}
          >
          {content?.title || 'Shop Now !'}
        </Text>
      </HStack>
      <ScrollView
        contentContainerStyle={[styles.scrollView, containerStyle]}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {renderCards()}
      </ScrollView>
    </VStack>
  );
};

export default HorizontalScrollableSection;
