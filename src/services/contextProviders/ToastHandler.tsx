import React, {useState, useEffect} from 'react';
import {Text, View, useToast} from 'native-base';
import {
  TextStyle,
  ViewStyle,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

const {width, height} = Dimensions.get('window');
const isDesktop = width > height;

type ShowToastArgs = {
  id?: string;
  title: string;
  description?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  timeLimit?: number;
  icon?: any;
  origin?: string;
};

type ShowToastMethod = (args: ShowToastArgs) => void;

const initialState: {showToast: ShowToastMethod; dismissAllToasts: Function} = {
  showToast: (args: ShowToastArgs) => {},
  dismissAllToasts: () => {},
};

export const ToastContext = React.createContext(initialState);

const AnimatedToast = ({
  id,
  title,
  description,
  containerStyle,
  titleStyle,
  descriptionStyle,
  icon,
  timeLimit,
  keyboardVisible,
  keyboardHeight,
  origin,
}: {
  id: any;
  title: string;
  description?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  icon?: any;
  timeLimit?: number;
  keyboardVisible: boolean;
  keyboardHeight: number;
  origin?: string;
}) => {
  const [slideAnim] = useState(
    new Animated.Value(keyboardVisible ? keyboardHeight : 70),
  );
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isDesktop ? -32 : origin == 'top' ? -10 : -40, // Adjust 50 for padding
      useNativeDriver: true,
    }).start();
  }, [slideAnim, keyboardVisible, keyboardHeight]);

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [
            isDesktop ? {translateX: slideAnim} : {translateY: slideAnim},
          ], // Always slide up from bottom
        },
      ]}>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          style={{color: '#FFFFFF', height: 24, width: 24}}
        />
      )}
      <View>
        <Text style={titleStyle}>{title}</Text>
        {description && (
          <Text style={descriptionStyle || titleStyle}>{description}</Text>
        )}
      </View>
    </Animated.View>
  );
};

const ToastProvider = (props: {children: React.ReactNode}) => {
  const toast = useToast();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        setKeyboardVisible(true);

        setKeyboardHeight(event.endCoordinates.height); // Get keyboard height
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const dismissAllToasts = () => toast.closeAll();

  const showToast: ShowToastMethod = ({
    id,
    title,
    description,
    containerStyle,
    titleStyle,
    descriptionStyle,
    icon,
    timeLimit = 1800,
    origin,
  }) => {
    if (!id || !toast.isActive(id)) {
      toast.show({
        id,
        render: () => (
          <AnimatedToast
            id={id}
            title={title}
            description={description}
            containerStyle={containerStyle}
            titleStyle={titleStyle}
            descriptionStyle={descriptionStyle}
            icon={icon}
            timeLimit={timeLimit}
            keyboardVisible={isKeyboardVisible}
            keyboardHeight={keyboardHeight}
          />
        ),
        placement: isDesktop
          ? 'top-right'
          : (origin as
              | 'top'
              | 'bottom'
              | 'top-right'
              | 'top-left'
              | 'bottom-left'
              | 'bottom-right'),
        duration: timeLimit,
      });
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissAllToasts,
      }}>
      {props.children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
