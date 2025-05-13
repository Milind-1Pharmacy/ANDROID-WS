import React from 'react';
import {LoadingScreen} from '@commonComponents';
import PassiveContainer from './PassiveContainer';
import {CardsIndex} from '@HouseOfCards';
import SectionIndex from './SectionIndex';
import {View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    gap: 8,
  },
  sectionContainer: {
    columnGap: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  firstSection: {
    borderRadius: 4,
    height: 'auto',
    paddingHorizontal: 8,
    backgroundColor: 'white',
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
  sectionBaseContainer: {
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#FEFEFE',
    marginHorizontal: 8,
    paddingVertical: 8,
    marginTop: 3,
  },
});

const DynamicView = ({
  loading = false,
  sections = [],
}: {
  loading?: boolean;
  sections?: Array<{
    type: string;
    cards?: Array<any>;
    content?: any;
  }>;
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Array.isArray(sections) &&
        sections
          .filter(
            section =>
              Array.isArray(section?.cards) && section.cards.length > 0,
          )
          .map((section, sectionIndex) => {
            const SectionComponent =
              section?.type && SectionIndex[section.type]
                ? SectionIndex[section.type]
                : PassiveContainer;
            return (
              <SectionComponent
                key={`${section?.type || 'section'}-${sectionIndex}`}
                containerStyle={styles.sectionContainer}
                sectionBaseStyle={
                  sectionIndex === 0
                    ? styles.firstSection
                    : styles.sectionBaseContainer
                }
                content={section.content}
                fontSize={18}
                color={'black'}>
                {Array.isArray(section?.cards) &&
                  section.cards.map((card, cardIndex) => {
                    const CardComponent =
                      card?.card_type && CardsIndex[card.card_type]
                        ? CardsIndex[card.card_type]
                        : () => null;

                    return (
                      <View
                        key={`${card?.card_type || 'card'}-${cardIndex}`}
                        style={{marginRight: 8}}>
                        <CardComponent {...(card || {})} />
                      </View>
                    );
                  })}
              </SectionComponent>
            );
          })}
    </View>
  );
};

export default DynamicView;
