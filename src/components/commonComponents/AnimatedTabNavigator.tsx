// AnimatedTabNavigator.tsx
import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPills,
  faSearch,
  faShoppingCart,
  faUser,
  faPrescription,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TabNavigationState} from '@react-navigation/native';

const {width} = Dimensions.get('window');

// Define types
interface TabItem {
  key: string;
  icon: IconDefinition;
  label: string;
}

export interface AnimatedTabNavigatorProps {
  onTabPress: (tabKey: string) => void;
  initialTab?: string;
  cartItemCount: number;
  state: TabNavigationState<any>;
  descriptors: any;
  navigation: any;
  icons?: {
    [key: string]: IconDefinition;
  };
  tabConfig: {
    [key: string]: {
      icon: IconDefinition;
      label: string;
    };
  };
}
interface StylesType {
  container: ViewStyle;
  tabBar: ViewStyle;
  tabButton: ViewStyle;
  iconContainer: ViewStyle;
  bubble: ViewStyle;
  indicator: ViewStyle;
  tabLabel: TextStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  fabButton: ViewStyle;
}

const AnimatedTabNavigator: React.FC<AnimatedTabNavigatorProps> = ({
  state,
  descriptors,
  navigation,
  initialTab,
  onTabPress = () => {},
  cartItemCount = 0,
  icons,
}) => {
  const [activeTab, setActiveTab] = useState<number>(state.index);
  const insets = useSafeAreaInsets();

  // Set up icons for each tab
  const defaultIcons = {
    Dashboard: faPills,
    Search: faSearch,
    QR: faPrescription,
    Cart: faShoppingCart,
    Profile: faUser,
  };

  // Use provided icons or fall back to defaults
  const tabIcons = icons || defaultIcons;

  // Update active tab when navigation state changes
  useEffect(() => {
    if (state.index !== activeTab) {
      setActiveTab(state.index);
      moveBubble(state.index);
    }
  }, [state.index]);

  // Set initial tab if provided
  useEffect(() => {
    if (initialTab) {
      const initialIndex = state.routes.findIndex(
        (route: any) => route.name === initialTab,
      );
      if (initialIndex !== -1 && initialIndex !== state.index) {
        // This is just to move the bubble animation, not to navigate
        setActiveTab(initialIndex);
        moveBubble(initialIndex);
      }
    }
  }, [initialTab]);

  // Animation values
  const bubbleAnim = useRef<Animated.Value>(
    new Animated.Value(state.index),
  ).current;
  const bubbleScale = useRef<Animated.Value>(new Animated.Value(1)).current;
  const tabAnimations = state.routes.map(
    () => useRef<Animated.Value>(new Animated.Value(1)).current,
  );

  // Handle moving the bubble indicator
  const moveBubble = (index: number): void => {
    // Animate the bubble position
    Animated.parallel([
      Animated.spring(bubbleAnim, {
        toValue: index,
        friction: 5,
        tension: 50,
        useNativeDriver: false,
      }),
      // Create a bubble scaling effect
      Animated.sequence([
        Animated.timing(bubbleScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(bubbleScale, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  // Handle tab press
  const handlePress = (route: any, index: number): void => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    // Don't do anything if tab is already focused or event was prevented
    if (index === activeTab || event.defaultPrevented) {
      return;
    }

    // Animate the pressed tab icon
    Animated.sequence([
      Animated.timing(tabAnimations[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabAnimations[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Move the bubble indicator
    moveBubble(index);

    // Handle special tabs
    if (route.name === 'QR' || route.name === 'Profile') {
      onTabPress(route.name);
    } else {
      // Standard navigation
      navigation.navigate(route.name);
    }
  };

  // Calculate dimensions
  const tabWidth = width / state.routes.length;

  // Bubble position animation
  const bubblePosition = bubbleAnim.interpolate({
    inputRange: state.routes.map((_: any, i: number) => i),
    outputRange: state.routes.map((_: any, i: number) => i * tabWidth),
  });

  // Bubble size animation
  const bubbleSize = bubbleScale.interpolate({
    inputRange: [0.8, 1],
    outputRange: [56, 60],
  });

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: insets.bottom > 0 ? insets.bottom - 8 : 8},
      ]}>
      {/* Animated floating bubble */}
      {/* <Animated.View
        style={[
          styles.bubble,
          {
            left: bubblePosition.interpolate({
              inputRange: state.routes.map((_: any, i: number) => i * tabWidth),
              outputRange: state.routes.map(
                (_: any, i: number) => i * tabWidth + tabWidth / 2 - 30,
              ),
            }),
            width: bubbleSize,
            height: bubbleSize,
          },
        ]}
      /> */}

      {/* Tab buttons */}
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const {options} = descriptors[route.key];
          const isFocused = state.index === index;

          // Special handling for the middle FAB button
          if (route.name === 'QR') {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.fabButton}
                onPress={() => onTabPress(route.name)}
                activeOpacity={0.7}>
                <FontAwesomeIcon
                  icon={tabIcons[route.name as keyof typeof tabIcons]}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={[
                styles.tabButton,
                isFocused && {backgroundColor: '#F1F9FF', borderRadius: 16},
              ]}
              onPress={() => handlePress(route, index)}
              activeOpacity={0.7}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {transform: [{scale: tabAnimations[index]}]},
                ]}>
                <FontAwesomeIcon
                  icon={
                    tabIcons[route.name as keyof typeof tabIcons] || faPills
                  }
                  size={route.name === 'Dashboard' ? 28 : 24}
                  color={isFocused ? '#2E6ACF' : '#D0D0D0'}
                />

                {/* Badge for cart items */}
                {route.name === 'Cart' && cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom indicator line */}
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [
              {
                translateX: bubbleAnim.interpolate({
                  inputRange: state.routes.map((_: any, i: number) => i),
                  outputRange: state.routes.map(
                    (_: any, i: number) => i * tabWidth,
                  ),
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create<StylesType>({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    // backgroundColor: '#2e6acf',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#E3F2FD',
    borderRadius: 30,
    zIndex: -1,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 56,
    height: 4,
    backgroundColor: '#2E6ACF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginLeft: 8,
    // marginBottom: 8,
    left: 5,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: -6,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  fabButton: {
    backgroundColor: '#2E6ACF',
    height: 52,
    width: 52,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 12,
    color: '#2E6ACF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AnimatedTabNavigator;
