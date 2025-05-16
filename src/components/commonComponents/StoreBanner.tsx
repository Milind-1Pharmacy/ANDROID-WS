import {
  HStack,
  IconButton,
  Image,
  Spinner,
  Text,
  VStack,
  View,
} from 'native-base';
import {Animated, Dimensions, StyleSheet} from 'react-native';
import {_1P_LOGO} from '@Constants';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import P1Badge from './P1Badge';
import {getInitials} from '@helpers';
import React, {useEffect, useState} from 'react';
import {border} from 'native-base/lib/typescript/theme/styled-system';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {DrawerActions, useNavigation} from '@react-navigation/native';
const {width, height} = Dimensions.get('screen');
const isDesktop = width > height;
const styles = StyleSheet.create({
  bannerBase: {
    alignItems: 'center',
    justifyContent: isDesktop ? 'space-around' : 'center',
    paddingHorizontal: isDesktop ? 16 : 0,
    paddingVertical: isDesktop ? 8 : 0,
    backgroundColor: isDesktop ? '#3C82F6' : '#2e6acf',
    // margin: 10,
    borderRadius: isDesktop ? 4 : 0,
    height: isDesktop ? 108 : 88,
    marginTop: isDesktop ? 0 : 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: isDesktop ? 88 : 64,
    width: 64,
    borderRadius: 500,
    backgroundColor: '#FFFFFF',
  },
  appMode: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 18,
    marginRight: 5,
  },
  actionSheetStyle: {
    alignItems: 'flex-start',
  },
  appModeListTitle: {
    color: '#3C3C3C',
    fontWeight: '700',
    fontSize: 22,
    marginVertical: 10,
  },
  appModeListItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 2,
    width: '100%',
  },
  appModeListItemText: {
    color: '#808080',
    fontWeight: '500',
    fontSize: 18,
  },
});

const WavingWelcome = ({customerName}: {customerName: string | undefined}) => {
  const [rotateAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const waveAnimation = Animated.sequence([
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: -1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    const loopAnimation = Animated.loop(
      Animated.sequence([
        waveAnimation,
        Animated.delay(2000), // Pause between waves
      ]),
    );

    loopAnimation.start();

    return () => {
      loopAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const AnimatedText = Animated.createAnimatedComponent(Text);

  return (
    <HStack space={2} alignItems="center">
      <Text color="rgba(255, 255, 255, 0.8)" fontSize={isDesktop ? 'xl' : 14}>
        Welcome back {customerName ? ',' : ''}{' '}
        {customerName?.split(' ')[0] || ''}
      </Text>
      <AnimatedText
        fontSize={isDesktop ? '3xl' : 20}
        style={{
          transform: [{rotate: rotateInterpolate}],
        }}>
        👋
      </AnimatedText>
    </HStack>
  );
};

const StoreBanner = (props: any) => {
  const {storeName, loading, imageUrl, customerName} = props;
  const navigation = useNavigation();
  return (
    <HStack style={{...styles.bannerBase, ...(props.bannerBaseStyle || {})}}>
      <HStack
        alignItems="center"
        flex={2}
        style={{maxWidth: width * 0.8, marginLeft: 4}}>
        <TouchableWithoutFeedback
          style={styles.logoContainer}
          onPress={() => {
            navigation.dispatch(DrawerActions.openDrawer());
          }}>
          {loading ? (
            <Spinner size="sm" color="#2E6ACF" />
          ) : imageUrl ? (
            <Image
              source={{uri: imageUrl}}
              style={{
                width: 54,
                height: isDesktop ? '80%' : 56,
                objectFit: 'cover',
                backgroundColor: 'transparent',
                borderRadius: 25,
              }}
              accessibilityLabel="store_logo"
              alt={getInitials(storeName)}
            />
          ) : (
            <Text bold color="#2E6ACF">
              {getInitials(storeName)}
            </Text>
          )}
        </TouchableWithoutFeedback>
        <VStack marginX={3}>
          <Text
            color="#FFFFFF"
            textTransform="capitalize"
            fontSize={isDesktop ? 32 : 18}
            fontWeight="500"
            noOfLines={1}
            textAlign={'left'}
            maxWidth={
              isDesktop
                ? width - 125
                : width > 375
                ? width - 148
                : width >= 320
                ? width - 140
                : width - 118
            }>
            {storeName &&
            storeName !== '' &&
            storeName.toLowerCase() !== 'local store not mapped'
              ? storeName
              : 'Loading...'}
            {/* ABC Pharamcutical XYZ BNO MOPA */}
          </Text>
          <WavingWelcome customerName={customerName} />
        </VStack>
      </HStack>
      {/* Cart Icon */}
      {props.actions && (
        <HStack alignItems="center" justifyContent="flex-end" space={1}>
          {props.actions.map((action: any, index: number) => {
            return (
              <View
                position="relative"
                key={action.id ? `${action.id}-${index}` : `${index}`}
                style={{
                  borderRadius: 25,
                  width: 64,
                  height: 88,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {action.badgeActive && (
                  <Text
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 20,
                      zIndex: 1,
                      backgroundColor: '#0ebd0e',
                      color: '#fff',
                      height: 20,
                      width: 20,
                      fontSize: 12,
                      borderRadius: 50,
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontWeight: '600',
                    }}>
                    {action.badge}
                  </Text>
                )}
                <IconButton
                  key={action.id ? `${action.id}-${index}` : `${index}`}
                  onPress={action.onPress}
                  icon={
                    <FontAwesomeIcon
                      icon={action.icon}
                      color="#FFFFFF"
                      size={isDesktop ? 28 : 24}
                    />
                  }
                  borderRadius={20}
                />
              </View>
            );
          })}
        </HStack>
      )}
    </HStack>
  );
};

export default StoreBanner;
