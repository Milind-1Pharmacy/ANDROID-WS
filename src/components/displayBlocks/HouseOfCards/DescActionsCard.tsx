import P1Styles from '@P1StyleSheet';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {IconButton, Text, View} from 'native-base';
import {
  Dimensions,
  Linking,
  Platform,
  PlatformIOSStatic,
  StyleSheet,
} from 'react-native';
import React from 'react';

const windowWidth = Dimensions.get('window').width;

const {isPad} = Platform as PlatformIOSStatic;

const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    ...P1Styles.shadow,
  },
  headBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#C0C0C0',
    paddingBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
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
  },
  detailItem: {
    width: isPad ? 200 : (windowWidth - 80) / 2,
    fontSize: isPad ? 14 : 12,
    color: '#505050',
  },
});

const DescActionsCard = (props: any) => {
  const {title, subtitle, actions, detailItems} = props.item;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const itemClickActions: {[key: string]: any} = {
    push: navigation.push,
    navigate: navigation.navigate,
    link: (url: string) => Linking.openURL.call(Linking, url),
  };

  return (
    <View
      style={{
        ...styles.cardBase,
        paddingVertical: isPad ? 15 : detailItems ? 10 : 5,
      }}>
      <View
        style={{
          ...styles.headBlock,
          ...(!detailItems ? {borderBottomWidth: 0} : {}),
          ...(!!subtitle ? {alignItems: 'flex-start'} : {}),
        }}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
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
      </View>
      {!!detailItems && (
        <View style={styles.detailsBlock}>
          {detailItems.map((item: string) => (
            <Text style={styles.detailItem} key={item}>
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default DescActionsCard;
