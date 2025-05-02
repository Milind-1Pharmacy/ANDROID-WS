import P1Styles from '@P1StyleSheet';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {HStack, IconButton, Text, ThreeDotsIcon, View} from 'native-base';
import {Dimensions, Linking, StyleSheet} from 'react-native';
import React from 'react';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingBottom: 15,
    ...P1Styles.shadow,
  },
  header: {
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    minHeight: 40,
    width: '100%',
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
  headBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    paddingRight: 10,
    marginTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#2E6ACF',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 15,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: '#808080',
  },
  actionsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  detailsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    paddingHorizontal: 15,
  },
  detailItem: {
    fontSize: 14,
    color: '#505050',
    marginRight: 10,
  },
  highlightDetailItem: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E6ACF',
    marginRight: 10,
  },
});

const IDActionsCard = (props: any) => {
  const {tag, title, subtitle, actions, detailItems, highlightDetails, badge} =
    props.item;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const itemClickActions: {[key: string]: any} = {
    push: navigation.push,
    navigate: navigation.navigate,
    link: (url: string) => Linking.openURL.call(Linking, url),
  };

  return (
    <View style={styles.cardBase}>
      <HStack style={styles.header}>
        <View style={styles.skewBackground} />
        {/* <LinearGradient useAngle={true} angle={45} angleCenter={{x:0.5,y:0.5}} colors={['#3F7BE0', '#3F7BE0', '#2E6ACF', '#1D59BE', '#1D59BE']} style={styles.skewBackground} /> */}
        <HStack
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          paddingX={2}>
          <Text color="#FFFFFF" fontSize={16} fontWeight="700">
            {(tag || '').trim()}
          </Text>
          <View style={styles.actionsBlock}>
            {(actions || []).map((action: any) => (
              <IconButton
                icon={
                  <FontAwesomeIcon
                    icon={action.icon}
                    size={20}
                    style={{color: '#2E6ACF'}}
                  />
                }
                onPress={() =>
                  itemClickActions[action.action](...action.actionParams)
                }
                key={JSON.stringify(action)}
              />
            ))}
          </View>
        </HStack>
      </HStack>
      <View style={styles.headBlock}>
        <View
          style={{
            ...styles.titleBlock,
            maxWidth: !!subtitle ? (65 * (windowWidth - 80)) / 100 : 'auto',
          }}>
          <Text style={styles.title}>{(title || '').trim()}</Text>
          {!!subtitle && (
            <Text style={styles.subtitle}>{(subtitle || '').trim()}</Text>
          )}
        </View>
      </View>
      {detailItems && (
        <View style={styles.detailsBlock}>
          {detailItems.map((item: string) => (
            <Text style={styles.detailItem} key={item}>
              {item}
            </Text>
          ))}
        </View>
      )}
      <HStack alignItems="center" justifyContent="space-between" paddingX={4}>
        {highlightDetails && (
          <View
            style={{
              ...styles.detailsBlock,
              paddingHorizontal: 0,
              width: '65%',
            }}>
            {highlightDetails.map((item: string) => (
              <Text style={styles.highlightDetailItem} key={item}>
                {item}
              </Text>
            ))}
          </View>
        )}
        {badge && (
          <View style={{width: '35%'}}>
            <Text textAlign="right" style={styles.highlightDetailItem}>
              {badge}
            </Text>
          </View>
        )}
      </HStack>
    </View>
  );
};

export default IDActionsCard;
