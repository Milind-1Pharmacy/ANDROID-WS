import React, {ReactNode} from 'react';
import {AlertDialog, Button} from 'native-base';
import {useRef} from 'react';
import {Dimensions, Platform, TouchableOpacity} from 'react-native';

const {width, height} = Dimensions.get('window');

const isDesktop = Platform.OS === 'web' && width > height;

const P1AlertDialog = ({
  isOpen,
  toggleOpen,
  heading,
  body,
  buttons,
  dismissable,
  hideCancel,
  onClose,
}: {
  isOpen: boolean;
  toggleOpen: any;
  heading: string;
  body: string | ReactNode;
  buttons: any[];
  dismissable?: boolean;
  hideCancel?: boolean;
  onClose?: any;
}) => {
  const cancelRef = useRef(null);

  const alertDialogDismissable = dismissable === false ? false : true;

  const toggleDialogOpen = () => {
    if (isOpen && alertDialogDismissable) {
      (onClose || toggleOpen)();
    }
  };

  const dialogButtons =
    alertDialogDismissable && !hideCancel
      ? [
          {
            label: 'Cancel',
            variant: 'unstyled',
            action: onClose || toggleDialogOpen,
            ref: cancelRef,
          },
          ...buttons,
        ]
      : buttons;

  const onActionButtonPress = (event: any, button: any) => {
    event.preventDefault();

    button.action();
  };

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={toggleDialogOpen}>
      <TouchableOpacity
        style={{
          width: '100%',
          height: '100%',
          justifyContent: isDesktop ? 'center' : 'flex-end',
          alignItems: 'center',
        }}
        onPress={toggleDialogOpen}>
        <AlertDialog.Content
          width="100%"
          borderTopLeftRadius={8}
          borderTopRightRadius={8}
          borderBottomRightRadius={isDesktop ? 8 : 0}
          borderBottomLeftRadius={isDesktop ? 8 : 0}>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>{heading}</AlertDialog.Header>
          {body && <AlertDialog.Body>{body}</AlertDialog.Body>}
          <AlertDialog.Footer padding={1}>
            <Button.Group>
              {dialogButtons.map((button: any, index: number) => (
                <Button
                  key={index}
                  variant={button.variant}
                  style={button.style}
                  onPress={(event: any) => onActionButtonPress(event, button)}
                  ref={button.ref}>
                  {button.label}
                </Button>
              ))}
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </TouchableOpacity>
    </AlertDialog>
  );
};

export default P1AlertDialog;
