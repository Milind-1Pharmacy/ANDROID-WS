import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Animated, Easing, Text} from 'react-native';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

const EfficientTruckLoader = () => {
  const [loadingText, setLoadingText] = useState('Loading');
  const roadAnimation = useRef(new Animated.Value(0)).current;
  const truckBounce = useRef(new Animated.Value(0)).current;
  const wheelRotation = useRef(new Animated.Value(0)).current;

  // Start animations when component mounts
  useEffect(() => {
    // Animate the road
    Animated.loop(
      Animated.timing(roadAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Animate truck bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(truckBounce, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(truckBounce, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animate wheel rotation
    Animated.loop(
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Animate loading text dots
    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Loading...') return 'Loading';
        if (prev === 'Loading..') return 'Loading...';
        if (prev === 'Loading.') return 'Loading..';
        return 'Loading.';
      });
    }, 500);

    return () => clearInterval(textInterval);
  }, []);

  // Interpolate animation values
  const roadTranslate = roadAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const truckTranslateY = truckBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const wheelRotationDeg = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrapper}>
        {/* Truck Body */}
        <Animated.View
          style={[
            styles.truckContainer,
            {transform: [{translateY: truckTranslateY}]},
          ]}>
          <Svg width={90} height={40} viewBox="0 0 90 40">
            {/* Cabin */}
            <Rect
              x="5"
              y="5"
              width="25"
              height="20"
              fill="#3b82f6"
              stroke="#1e3a8a"
              strokeWidth="2"
              rx="3"
            />

            {/* Truck body */}
            <Rect
              x="30"
              y="10"
              width="45"
              height="15"
              fill="#f87171"
              stroke="#7f1d1d"
              strokeWidth="2"
              rx="2"
            />

            {/* Window */}
            <Rect
              x="10"
              y="8"
              width="15"
              height="10"
              fill="#e5e7eb"
              stroke="#1e3a8a"
              strokeWidth="1"
              rx="1"
            />

            {/* Headlight */}
            <Rect
              x="5"
              y="15"
              width="3"
              height="4"
              fill="#fef08a"
              stroke="#1e3a8a"
              strokeWidth="1"
              rx="1"
            />

            {/* Bumper */}
            <Rect
              x="0"
              y="19"
              width="5"
              height="6"
              fill="#94a3b8"
              stroke="#334155"
              strokeWidth="1"
              rx="1"
            />
          </Svg>
        </Animated.View>

        {/* Wheels */}
        <View style={styles.wheelsContainer}>
          <Animated.View
            style={[styles.wheel, {transform: [{rotate: wheelRotationDeg}]}]}>
            <Svg height="20" width="20" viewBox="0 0 20 20">
              <Circle
                cx="10"
                cy="10"
                r="8"
                fill="#1e293b"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <Circle cx="10" cy="10" r="3" fill="#94a3b8" />
              <Path d="M10 4 L10 16" stroke="#94a3b8" strokeWidth="1" />
              <Path d="M4 10 L16 10" stroke="#94a3b8" strokeWidth="1" />
            </Svg>
          </Animated.View>

          <Animated.View
            style={[styles.wheel, {transform: [{rotate: wheelRotationDeg}]}]}>
            <Svg height="20" width="20" viewBox="0 0 20 20">
              <Circle
                cx="10"
                cy="10"
                r="8"
                fill="#1e293b"
                stroke="#0f172a"
                strokeWidth="2"
              />
              <Circle cx="10" cy="10" r="3" fill="#94a3b8" />
              <Path d="M10 4 L10 16" stroke="#94a3b8" strokeWidth="1" />
              <Path d="M4 10 L16 10" stroke="#94a3b8" strokeWidth="1" />
            </Svg>
          </Animated.View>
        </View>

        {/* Road */}
        <View style={styles.road}>
          <Animated.View
            style={[
              styles.roadMarks,
              {transform: [{translateX: roadTranslate}]},
            ]}
          />
        </View>
      </View>

      {/* Loading Text */}
      <Text style={styles.loadingText}>{loadingText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loaderWrapper: {
    width: 120,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  truckContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    zIndex: 2,
  },
  wheelsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 70,
    bottom: 5,
    left: 15,
    zIndex: 3,
  },
  wheel: {
    width: 20,
    height: 20,
  },
  road: {
    width: '100%',
    height: 2,
    backgroundColor: '#334155',
    position: 'absolute',
    bottom: 14,
  },
  roadMarks: {
    position: 'absolute',
    width: 200,
    height: 2,
    flexDirection: 'row',
  },
  roadMark: {
    width: 10,
    height: 2,
    backgroundColor: '#f8fafc',
    marginRight: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});

export default EfficientTruckLoader;
