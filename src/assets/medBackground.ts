import {IconProp} from '@fortawesome/fontawesome-svg-core';
import {Dimensions} from 'react-native';

const backgroundIcons: IconProp[] = [
  'stethoscope',
  'hospital',
  'tablet',
  'syringe',
  'prescription-bottle-medical',
  'prescription-bottle',
  'prescription',
  'pills',
  'house-medical',
  'house-chimney',
  'file-prescription',
  'capsules',
];

const {height, width} = Dimensions.get('window');

const iconsCount = Math.round((height * width) / 256);

var medBackground: {
  icon: IconProp;
  rotation: string;
}[] = [];

const generateMedBackground = () => {
  medBackground = Array.from(
    {length: (iconsCount - 0) / 1 + 1},
    (value, index) => 0 + index * 1,
  ).map(index => ({
    icon: backgroundIcons[Math.floor(Math.random() * 11)],
    rotation: `${Math.floor(Math.random() * 360)}deg`,
  }));
};

export {generateMedBackground, medBackground};
