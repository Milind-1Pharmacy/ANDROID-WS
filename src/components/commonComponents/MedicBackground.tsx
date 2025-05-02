import {medBackground} from '@assets';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {View} from 'native-base';
import {Dimensions, StyleSheet} from 'react-native';
import React from 'react';

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  backgroundIcon: {
    margin: 2,
    color: '#EAEAEA',
  },
});

const MedicBackground = () => {
  return (
    <View style={{...styles.backgroundContainer, width, height}}>
      {medBackground.map(
        (iconProfile: {icon: IconProp; rotation: string}, index: number) => (
          <FontAwesomeIcon
            key={index}
            size={20}
            style={{
              ...styles.backgroundIcon,
              transform: [{rotate: iconProfile.rotation}],
            }}
            icon={iconProfile.icon}
          />
        ),
      )}
    </View>
  );
};

export default MedicBackground;
