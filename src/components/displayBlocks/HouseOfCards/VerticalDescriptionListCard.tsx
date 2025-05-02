import P1Styles from '@P1StyleSheet';
import {InfoScreen} from '@commonComponents';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {
  ChevronRightIcon,
  FavouriteIcon,
  HStack,
  Spinner,
  Text,
  View,
} from 'native-base';
import {Dimensions, Linking, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    width: windowWidth - 40,
    paddingBottom: 10,
    minHeight: 80,
    alignSelf: 'center',
    ...P1Styles.shadow,
  },
  cardHeader: {
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    minHeight: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
    borderBottomColor: '#2E6ACF',
    borderBottomWidth: 1,
    ...P1Styles.shadowLarge,
  },
  skewBackground: {
    position: 'absolute',
    left: -100,
    backgroundColor: '#2E6ACF',
    height: 450,
    width: 300,
    transform: [{skewY: '60deg'}],
  },
  cardHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    flexWrap: 'wrap',
    maxWidth: (50 * (windowWidth - 80)) / 100,
  },
  headerIconContainer: {
    height: 25,
    justifyContent: 'center',
  },
  cardHeaderIcon: {
    color: '#2E6ACF',
    marginRight: 10,
  },
  descItemBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  descTitle: {
    fontSize: 14,
    lineHeight: 18,
    padding: 5,
    width: '65%',
  },
  descValue: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    padding: 5,
  },
});

const VerticalDescriptionListCard = (props: any) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const itemClickActions: {[key: string]: any} = {
    push: navigation.push,
    navigate: navigation.navigate,
    link: (url: string) => Linking.openURL.call(Linking, url),
  };

  const loaded = props.loaded === false ? false : true;

  return (
    <View style={styles.cardBase}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() =>
          (itemClickActions[props.data.action] || (() => {}))(
            ...(props.data.actionParams || []),
          )
        }>
        <View style={styles.skewBackground} />
        {/* <LinearGradient useAngle={true} angle={45} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#3F7BE0', '#3F7BE0', '#2E6ACF', '#1D59BE', '#1D59BE']} style={styles.skewBackground} /> */}
        <HStack
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          paddingX={2}
          paddingY={1}>
          <View style={styles.cardHeadingContainer}>
            {props.data.icon && (
              <FavouriteIcon size={5} style={styles.cardHeaderIcon} />
            )}
            <Text style={styles.cardHeading}>{props.data.title}</Text>
          </View>
          <View style={styles.headerIconContainer}>
            {loaded ? (
              <ChevronRightIcon
                style={{...styles.cardHeaderIcon, justifySelf: 'flex-end'}}
              />
            ) : (
              <Spinner color="#2E6ACF" marginY={5} alignSelf="center" />
            )}
          </View>
        </HStack>
      </TouchableOpacity>
      <View paddingX={2}>
        {loaded && (
          <>
            {props.data.items.length === 0 ? (
              <InfoScreen
                containerStyle={{width: '100%', paddingVertical: 10}}
                content={
                  <HStack alignItems="center">
                    <FontAwesomeIcon
                      icon="circle-info"
                      size={10}
                      color="#D00000"
                      style={{marginRight: 5}}
                    />
                    <Text>No data to display</Text>
                  </HStack>
                }
              />
            ) : (
              (props.data.items || []).map((item: any, index: number) => (
                <View
                  style={styles.descItemBlock}
                  key={item.title + item.value + index}>
                  <Text style={styles.descTitle}>{item.title}</Text>
                  <Text style={styles.descValue}>{item.value}</Text>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default VerticalDescriptionListCard;
