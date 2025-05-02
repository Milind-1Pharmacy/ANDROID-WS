import {Actionsheet, useDisclose, useKeyboardBottomInset} from 'native-base';
import React, {useCallback, useMemo} from 'react';
import {TouchableHighlight} from 'react-native';

export type BottomSheetRef = {
  isOpen?: boolean;
  openSheet?: () => void;
  onClose?: () => void;
};

const BottomActionSheet = (props: any) => {
  const {isOpen, onOpen, onClose} = useDisclose();

  const {SheetContent} = props;

  const openSheet = useCallback(() => {
    (props.beforeOpen || (() => {}))();

    onOpen();

    (props.afterOpen || (() => {}))();
  }, [onOpen]);

  const renderComponent = useMemo(
    () =>
      isOpen && (
        <SheetContent isOpen={isOpen} onOpen={openSheet} onClose={onClose} />
      ),
    [isOpen, SheetContent],
  );

  if (props.setRef) {
    props.setRef({isOpen, openSheet, onClose});
  }

  const bottomInset = useKeyboardBottomInset();

  return (
    <>
      {props.handle && (
        <TouchableHighlight
          style={{
            paddingHorizontal: 2,
            paddingVertical: 1,
            borderRadius: 30,
            ...(props.handleContainerStyle || {}),
          }}
          disabled={props.disabled}
          underlayColor={props.underlayColor || '#EFEFEF'}
          onPress={openSheet}>
          {props.handle}
        </TouchableHighlight>
      )}
      <Actionsheet
        isOpen={isOpen}
        onClose={onClose}
        bottom={bottomInset > 0 ? bottomInset + 110 : bottomInset}>
        <Actionsheet.Content padding={0} style={props.actionSheetStyle}>
          {renderComponent}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

export default BottomActionSheet;
