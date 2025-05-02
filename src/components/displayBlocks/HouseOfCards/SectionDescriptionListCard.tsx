import P1Styles from '@P1StyleSheet';
import {
  ChevronRightIcon,
  FavouriteIcon,
  HStack,
  Spinner,
  Text,
  View,
} from 'native-base';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    width: windowWidth - 40,
    minHeight: 80,
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
  rootDescBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    marginHorizontal: 5,
  },
  rootDescItemBlock: {
    marginRight: 10,
    marginVertical: 10,
  },
  rootDescTitle: {
    fontSize: 16,
    lineHeight: 18,
    padding: 5,
  },
  rootDescValue: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
    padding: 5,
  },
  sectionBlock: {
    width: '100%',
  },
  sectionTitleContainer: {
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
    padding: 5,
  },
  sectionDescItemBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
    marginHorizontal: 10,
  },
  sectionDescTitle: {
    fontSize: 16,
    lineHeight: 18,
    padding: 5,
  },
  sectionDescValue: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    padding: 5,
  },
});

const SectionDescriptionListCard = (props: any) => {
  return (
    <View style={styles.cardBase}>
      <TouchableOpacity style={styles.cardHeader}>
        {/* <LinearGradient useAngle={true} angle={45} angleCenter={{x:0.5,y:0.5}} colors={['#3F7BE0', '#3F7BE0', '#2E6ACF', '#1D59BE', '#1D59BE']} style={styles.skewBackground} /> */}
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
            {props.loaded ? (
              <ChevronRightIcon
                style={{...styles.cardHeaderIcon, justifySelf: 'flex-end'}}
              />
            ) : (
              <Spinner color="#2E6ACF" marginY={5} alignSelf="center" />
            )}
          </View>
        </HStack>
      </TouchableOpacity>
      {
        <>
          {!!props.data.rootSectionItems && (
            <View style={styles.rootDescBlock}>
              {(props.data.rootSectionItems || []).map((item: any) => (
                <View
                  style={styles.rootDescItemBlock}
                  key={item.title + item.value}>
                  <Text style={styles.rootDescTitle}>{item.title}</Text>
                  <Text style={styles.rootDescValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}
          {(props.data.sections || []).map((section: any) => (
            <View key={section.title}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View>
                {section.contents.map((item: any) => (
                  <View
                    style={styles.sectionDescItemBlock}
                    key={item.title + item.value}>
                    <Text style={styles.sectionDescTitle}>{item.title}</Text>
                    <Text style={styles.sectionDescValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>
      }
    </View>
  );
};

export default SectionDescriptionListCard;
