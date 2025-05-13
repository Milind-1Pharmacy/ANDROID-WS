import React from 'react';
import {memo, useMemo} from 'react';
import {Button, Divider, HStack, Text, View} from 'native-base';
import {
  Dimensions,
  GestureResponderEvent,
  Platform,
  ViewStyle,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCirclePlus, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {RUPEE_SYMBOL} from '@Constants';

const SCREEN_DIMENSIONS = Dimensions.get('screen');
const IS_DESKTOP =
  Platform.OS === 'web' && SCREEN_DIMENSIONS.width > SCREEN_DIMENSIONS.height;

// Memoize darkenColor function with useCallback-like behavior
const darkenColor = (() => {
  const cache = new Map<string, string>();

  return (color: string, amount: number = 0.1) => {
    const cacheKey = `${color}-${amount}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));
    const result = `rgb(${r}, ${g}, ${b})`;
    cache.set(cacheKey, result);
    return result;
  };
})();

const Counter = memo(
  (props: {
    value: number;
    zeroCounterLabel?: any;
    add: (event: GestureResponderEvent) => void;
    subtract: (event: GestureResponderEvent) => void;
    containerStyle?: ViewStyle;
    labelColor?: string;
    buttonPadding?: number;
    price?: number;
    textSize?: number;
    showPlusIcon?: boolean;
    borderRadius?: number;
    buttonBorderRadius?: number;
  }) => {
    const {
      value,
      zeroCounterLabel,
      add,
      subtract,
      containerStyle = {},
      labelColor = '#333',
      buttonPadding,
      price,
      textSize = IS_DESKTOP ? 16 : 14,
      showPlusIcon = true,
      borderRadius = 16,
    } = props;

    // Memoize derived styles
    const styles = useMemo(() => {
      const bgColor = containerStyle.backgroundColor?.toString() || '#F5F5F5';
      const darkenedBg = darkenColor(bgColor, 0.1);

      return {
        container: {
          ...containerStyle,
          borderRadius: containerStyle.borderRadius ?? borderRadius,
          backgroundColor: bgColor,
        },
        button: {
          borderRadius: containerStyle.borderRadius ?? borderRadius,
          backgroundColor: darkenedBg,
          flex: IS_DESKTOP ? 0.33 : 0.33,
        },
        addButton: {
          backgroundColor: bgColor,
          borderRadius,
        },
      };
    }, [containerStyle, borderRadius]);

    // Memoize price formatting
    const formattedPrice = useMemo(() => {
      if (!price) return null;
      return (
        RUPEE_SYMBOL +
        ' ' +
        price.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        })
      );
    }, [price]);

    if (value > 0) {
      return (
        <HStack
          alignItems="center"
          justifyContent="space-between"
          style={styles.container}>
          <Button
            variant="ghost"
            p={buttonPadding}
            onPress={subtract}
            _pressed={{opacity: 0.6}}
            style={styles.button}>
            <FontAwesomeIcon
              size={IS_DESKTOP ? 18 : 14}
              color={labelColor}
              icon={faMinus}
            />
          </Button>

          <Text
            textAlign="center"
            bold
            fontSize={textSize}
            color={labelColor}
            style={{elevation: 10}}>
            {value}
          </Text>

          <Button
            variant="ghost"
            p={buttonPadding}
            onPress={add}
            _pressed={{opacity: 0.6}}
            style={styles.button}>
            <FontAwesomeIcon
              size={IS_DESKTOP ? 18 : 14}
              color={labelColor}
              icon={faPlus}
            />
          </Button>
        </HStack>
      );
    }

    return (
      <Button
        variant="solid"
        p={buttonPadding}
        onPress={add}
        _pressed={{opacity: 0.8}}
        style={styles.addButton}>
        <HStack alignItems="center" space={2} justifyContent="center">
          <Text
            fontSize={textSize}
            fontWeight="500"
            borderRadius={16}
            color={labelColor}>
            {zeroCounterLabel}
          </Text>
          {showPlusIcon && (
            <FontAwesomeIcon
              size={IS_DESKTOP ? 18 : 14}
              color={labelColor}
              icon={faCirclePlus}
            />
          )}
          {formattedPrice && (
            <HStack alignItems="center" space={1}>
              <Divider orientation="vertical" height={14} />
              <Text fontSize={textSize} color={labelColor}>
                {formattedPrice}
              </Text>
            </HStack>
          )}
        </HStack>
      </Button>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.value === nextProps.value &&
      prevProps.zeroCounterLabel === nextProps.zeroCounterLabel &&
      prevProps.labelColor === nextProps.labelColor &&
      prevProps.price === nextProps.price &&
      prevProps.showPlusIcon === nextProps.showPlusIcon &&
      JSON.stringify(prevProps.containerStyle) ===
        JSON.stringify(nextProps.containerStyle)
    );
  },
);

export default Counter;
