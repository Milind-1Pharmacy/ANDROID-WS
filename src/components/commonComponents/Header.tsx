import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import {HStack, IconButton, Spinner, Text} from 'native-base';
import {StyleSheet} from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
});

const Header = ({
  loading,
  disableGoback,
  screenTitle,
  screenTitleLoadingPlaceholder,
  controls,
  headerBaseStyle,
  textColor,
}: {
  loading?: boolean;
  disableGoback?: boolean;
  screenTitle: string;
  screenTitleLoadingPlaceholder?: string;
  controls?: JSX.Element;
  headerBaseStyle?: any;
  textColor?: string;
}) => {
  const {goBack} = useNavigation();

  return (
    <HStack style={{...styles.header, ...(headerBaseStyle || {})}}>
      <HStack space={2} alignItems="center">
        {!disableGoback && (
          <IconButton
            variant="unstyled"
            onPress={goBack}
            p={0}
            icon={
              <FontAwesomeIcon
                icon="arrow-left"
                size={20}
                color={textColor || '#FFFFFF'}
              />
            }
          />
        )}
        {loading ? (
          screenTitleLoadingPlaceholder ? (
            <Text
              textTransform="capitalize"
              color={textColor || '#FFFFFF'}
              fontSize={20}
              fontWeight="400">
              {screenTitleLoadingPlaceholder}
            </Text>
          ) : (
            <Spinner color={textColor || '#FFFFFF'} />
          )
        ) : (
          <Text
            textTransform="capitalize"
            color={textColor || '#FFFFFF'}
            ml={disableGoback ? 0 : 2}
            fontSize={20}
            fontWeight="600">
            {screenTitle}
          </Text>
        )}
      </HStack>
      {controls && (
        <HStack space={2} alignItems="center">
          {controls}
        </HStack>
      )}
    </HStack>
  );
};

export default Header;
