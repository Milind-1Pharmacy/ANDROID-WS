import React, {useEffect} from 'react';
import {View, StyleSheet, Animated, Easing, Text} from 'react-native';

const BeautifulLoader = ({message = 'Loading...'}) => {
  // Animation values
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.8);
  const opacityValue = new Animated.Value(0);
  const pulseOpacityValue = new Animated.Value(0.4);

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Pulse opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacityValue, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacityValue, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Interpolate rotation value
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrapper}>
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              opacity: opacityValue,
              transform: [{scale: scaleValue}],
            },
          ]}>
          {/* Outer circle with rotating effect */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{rotate: spin}],
              },
            ]}>
            <View style={styles.arcTop} />
            <View style={styles.arcRight} />
            <View style={styles.arcBottom} />
            <View style={styles.arcLeft} />
          </Animated.View>

          {/* Inner pulse */}
          <Animated.View
            style={[
              styles.innerCircle,
              {
                opacity: pulseOpacityValue,
              },
            ]}
          />

          {/* Center dot */}
          <View style={styles.centerDot} />
        </Animated.View>

        {/* Loading text */}
        <Animated.Text
          style={[
            styles.loadingText,
            {
              opacity: opacityValue,
            },
          ]}>
          {message || 'Loading...'}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrapper: {
    alignItems: 'center',
  },
  loaderContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
  },
  arcTop: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#2E6ACF',
    borderRadius: 2,
  },
  arcRight: {
    position: 'absolute',
    top: 20,
    right: 0,
    bottom: 20,
    width: 4,
    backgroundColor: '#4169E1',
    borderRadius: 2,
  },
  arcBottom: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#7B68EE',
    borderRadius: 2,
  },
  arcLeft: {
    position: 'absolute',
    top: 20,
    left: 0,
    bottom: 20,
    width: 4,
    backgroundColor: '#9370DB',
    borderRadius: 2,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E6ACF',
  },
  centerDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'white',
    position: 'absolute',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BeautifulLoader;
