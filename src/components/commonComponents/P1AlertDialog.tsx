import React, {useRef, ReactNode} from 'react';
import {
  Modal,
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Icon,
  IconButton,
  useTheme,
  ScrollView,
  Divider,
  Center,
  Image,
  Factory,
  Spinner,
} from 'native-base';
import {Dimensions, Platform} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faPills,
} from '@fortawesome/free-solid-svg-icons';

const {width, height} = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width > height;

// Create a Factory component for FontAwesome icons to use with NativeBase
const FaIcon = Factory(FontAwesomeIcon);

// Dialog button interface
interface DialogButton {
  label: string;
  variant?: 'solid' | 'outline' | 'ghost' | 'unstyled';
  action: () => void;
  ref?: React.RefObject<any>;
  icon?: any;
  colorScheme?: string;
  style?: any; // Added style property for individual button styling
}

// Dialog types for different visual styles
type DialogType = 'default' | 'success' | 'warning' | 'error' | 'info';

interface PharmaDialogProps {
  isOpen: boolean;
  toggleOpen: () => void;
  heading: string;
  body: string | ReactNode;
  buttons: DialogButton[];
  dismissable?: boolean;
  hideCancel?: boolean;
  onClose?: () => void;
  type?: DialogType;
  icon?: boolean;
  loading?: boolean;
  headerBg?: string;
  style?: {
    modalContent?: any;
    header?: any;
    headerText?: any;
    body?: any;
    footer?: any;
    buttons?: any;
  };
}

/**
 * Modern Pharmaceutical Dialog Component
 */
const PharmaDialog: React.FC<PharmaDialogProps> = ({
  isOpen,
  toggleOpen,
  heading,
  body,
  buttons = [],
  dismissable = true,
  hideCancel = false,
  onClose,
  type = 'default',
  icon = false,
  loading = false,
  headerBg,
  style = {},
}) => {
  const cancelRef = useRef(null);
  const theme = useTheme();

  // Theme colors
  const primaryColor = '#2e6acf';
  const secondaryColor = '#f0f5ff';
  const successColor = '#34c759';
  const warningColor = '#ff9500';
  const errorColor = '#ff3b30';
  const infoColor = '#5ac8fa';
  const dangerColor = '#ff3b30'; // For red logout dialog

  // Get header color based on dialog type
  const getHeaderColor = () => {
    if (headerBg) return headerBg;

    switch (type) {
      case 'success':
        return successColor;
      case 'warning':
        return warningColor;
      case 'error':
        return errorColor;
      case 'info':
        return infoColor;
      default:
        return primaryColor;
    }
  };

  // Get icon based on dialog type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'warning':
        return faExclamationCircle;
      case 'error':
        return faTimes;
      case 'info':
        return faInfoCircle;
      default:
        return faPills;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      toggleOpen();
    }
  };

  const dialogButtons =
    dismissable && !hideCancel
      ? [
          {
            label: 'Cancel',
            variant: 'outline',
            action: handleClose,
            ref: cancelRef,
            icon: undefined,
            colorScheme: 'primary',
            style: {},
          },
          ...buttons,
        ]
      : buttons;

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismissable ? handleClose : undefined}
      size={isDesktop ? 'md' : 'full'}
      animationPreset="slide">
      <Modal.Content
        borderRadius="2xl"
        shadow={9}
        bg="white"
        maxWidth={isDesktop ? '400px' : '90%'}
        mx={isDesktop ? 'auto' : 4}
        overflow="hidden"
        {...(style.modalContent || {})}>
        {/* Dialog Header */}
        <Box
          bg={getHeaderColor()}
          px={5}
          py={4}
          borderTopRadius="2xl"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          {...(style.header || {})}>
          <HStack space={3} alignItems="center">
            {icon && (
              <Box mr={2}>
                <FaIcon icon={getIcon()} color="white" size={20} />
              </Box>
            )}
            <Text
              color="white"
              fontSize="lg"
              fontWeight="bold"
              letterSpacing="0.3px"
              {...(style.headerText || {})}>
              {heading}
            </Text>
          </HStack>

          {dismissable && (
            <IconButton
              variant="unstyled"
              _pressed={{bg: 'rgba(255,255,255,0.2)'}}
              icon={<FaIcon icon={faTimes} color="white" size={18} />}
              onPress={handleClose}
            />
          )}
        </Box>

        {/* Dialog Body */}
        <ScrollView>
          <Box p={5} maxHeight={height * 0.5} {...(style.body || {})}>
            {loading ? (
              <Center py={8}>
                <Spinner size="lg" color={primaryColor} />
                <Text mt={4} color="gray.500">
                  Loading...
                </Text>
              </Center>
            ) : typeof body === 'string' ? (
              <Text fontSize="md" lineHeight="lg">
                {body}
              </Text>
            ) : (
              body
            )}
          </Box>
        </ScrollView>

        <Divider />

        {/* Dialog Footer */}
        <Box p={4} {...(style.footer || {})}>
          <HStack space={3} justifyContent="flex-end">
            {dialogButtons.map((button, index) => {
              const isMainAction = index === dialogButtons.length - 1;

              // Style variations based on button type
              const getButtonStyle = () => {
                let colorScheme =
                  button.colorScheme || (type !== 'default' ? type : 'primary');
                let baseColor: string;

                switch (colorScheme) {
                  case 'success':
                    baseColor = successColor;
                    break;
                  case 'warning':
                    baseColor = warningColor;
                    break;
                  case 'error':
                    baseColor = errorColor;
                    break;
                  case 'danger':
                    baseColor = dangerColor;
                    break;
                  case 'info':
                    baseColor = infoColor;
                    break;
                  default:
                    baseColor = primaryColor;
                }

                switch (button.variant) {
                  case 'outline':
                    return {
                      borderColor: baseColor,
                      borderWidth: 1,
                      bg: 'transparent',
                      _text: {color: baseColor},
                      _pressed: {bg: `${baseColor}10`},
                    };
                  case 'ghost':
                    return {
                      bg: 'transparent',
                      _text: {color: baseColor},
                      _pressed: {bg: `${baseColor}10`},
                    };
                  case 'unstyled':
                    return {
                      bg: 'transparent',
                      _text: {color: 'gray.500'},
                      _pressed: {bg: 'gray.100'},
                    };
                  default:
                    return isMainAction
                      ? {
                          bg: baseColor,
                          _text: {color: 'white'},
                          _pressed: {bg: `${baseColor}90`},
                        }
                      : {
                          bg: `${baseColor}20`,
                          _text: {color: baseColor},
                          _pressed: {bg: `${baseColor}30`},
                        };
                }
              };

              // Apply custom button style if provided
              const buttonStyle = getButtonStyle();
              const customButtonStyle = style.buttons || {};

              return (
                <Pressable
                  key={index}
                  ref={button.ref}
                  onPress={button.action}
                  py={2.5}
                  px={5}
                  borderRadius="lg"
                  {...buttonStyle}
                  {...customButtonStyle}
                  {...(button.style || {})}>
                  <HStack space={2} alignItems="center">
                    {button.icon && (
                      <FaIcon
                        icon={button.icon}
                        color={
                          customButtonStyle._text?.color ||
                          buttonStyle._text.color
                        }
                        size={16}
                      />
                    )}
                    <Text
                      fontWeight={isMainAction ? 'bold' : 'medium'}
                      color={
                        customButtonStyle._text?.color ||
                        buttonStyle._text.color
                      }
                      fontSize="sm">
                      {button.label}
                    </Text>
                  </HStack>
                </Pressable>
              );
            })}
          </HStack>
        </Box>
      </Modal.Content>
    </Modal>
  );
};

export default PharmaDialog;
