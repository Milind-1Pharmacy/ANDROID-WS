import P1Styles from '@P1StyleSheet';
import {
  FlatList,
  Input,
  KeyboardAvoidingView,
  Modal,
  SearchIcon,
  Spinner,
  Text,
  View,
} from 'native-base';
import {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    ...P1Styles.shadow,
  },
  modalBase: {
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  modal: {
    alignSelf: 'center',
    width: 300,
    height: 'auto',
    justifyContent: 'flex-start',
    borderRadius: 20,
    // ...P1Styles.shadow
  },
  searchIcon: {
    marginLeft: 10,
  },
  elevatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    ...P1Styles.shadow,
  },
  customInputText: {
    fontSize: 17,
    marginLeft: 5,
  },
  customInputPlaceholder: {
    fontSize: 17,
    color: '#A9A9A9',
    marginLeft: 5,
  },
  suggestionsBox: {
    alignSelf: 'center',
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 10,
    ...P1Styles.shadow,
  },
  listItem: {
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#F6F6F6',
  },
  suggestionsList: {
    borderRadius: 15,
    margin: 5,
    padding: 5,
  },
  suggestionsBackdrop: {
    height: 300,
    justifyContent: 'flex-end',
  },
});

const ReferenceField = (props: any) => {
  const [suggestions, setSuggestions] = useState(props.suggestions || []);
  const [value, setValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(
    (props.selectedItem || {})[props.titleField] || value || '',
  );
  const inputRef = useRef<TextInput>(null);

  const onSelect = (item: any) => {
    (props.onSelect || (() => {}))(item);

    setModalVisible(false);

    if (!props.value) {
      setSelectedItem(item[props.titleField] || '');
    }
  };

  useEffect(() => {
    if ((props.value || value || '').length > 0) {
      setSuggestions(
        (props.referenceList || []).filter((item: any) =>
          (props.filter || (() => false))(props.value || value || '', item),
        ),
      );
    } else {
      setSuggestions([]);
    }
  }, [props.value, value]);

  const suggestionsBoxAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(suggestionsBoxAnim, {
      toValue: contentHeight,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [contentHeight]);

  const openModal = () => {
    setModalVisible(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View style={{...props.containerStyle, overflow: 'visible', zIndex: 1000}}>
      <Modal isOpen={modalVisible} onClose={setModalVisible}>
        <KeyboardAvoidingView behavior="position" style={styles.modal}>
          <TouchableOpacity
            style={styles.suggestionsBackdrop}
            onPress={() => setModalVisible(false)}>
            <Animated.View
              style={{
                ...styles.suggestionsBox,
                height: suggestionsBoxAnim,
              }}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={(width, height) => {
                  setContentHeight(
                    height === 0 ? 0 : height + 20 > 300 ? 300 : height + 20,
                  );
                }}
                style={styles.suggestionsList}
                data={suggestions}
                renderItem={({item, index}: {item: any; index: number}) => (
                  <TouchableOpacity
                    onPress={(event: any) => {
                      event.preventDefault();

                      (onSelect || (() => {}))(item);
                    }}
                    style={{
                      ...styles.listItem,
                      marginBottom: index === suggestions.length - 1 ? 0 : 5,
                    }}>
                    <Text bold fontSize={12}>
                      {item[props.titleField] || ''}
                    </Text>
                    {props.subTitleField && item[props.subTitleField] && (
                      <Text fontSize={12}>
                        {props.subTitleHeading}{' '}
                        {item[props.subTitleField] || ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => JSON.stringify(item) + index}
              />
            </Animated.View>
          </TouchableOpacity>
          <View style={styles.inputBox}>
            <Input
              ref={inputRef}
              borderColor="transparent"
              size="xl"
              keyboardType={props.keyboardType}
              placeholder={props.placeholder}
              w="100%"
              value={props.value || value}
              onChangeText={props.onChangeText || setValue}
              InputLeftElement={
                props.loading ? (
                  <Spinner />
                ) : (
                  <SearchIcon style={styles.searchIcon} />
                )
              }
              _focus={{
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {props.label && (
        <Text
          style={{
            fontSize: 12,
            marginBottom: 5,
            marginLeft: 5,
            ...(props.labelStyle || {}),
          }}>
          {props.label}
        </Text>
      )}
      <TouchableOpacity
        onPress={openModal}
        style={{...styles.elevatedCard, ...(props.fieldStyle || {})}}>
        {props.loading ? (
          <Spinner />
        ) : props.fieldIcon ? (
          props.fieldIcon
        ) : (
          <SearchIcon />
        )}
        <Text
          style={
            props.value || selectedItem || value
              ? {...styles.customInputText, ...(props.textStyle || {})}
              : {
                  ...styles.customInputPlaceholder,
                  ...(props.placeholderStyle || {}),
                }
          }>
          {props.value || selectedItem || value
            ? props.value || selectedItem || value
            : props.placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReferenceField;
