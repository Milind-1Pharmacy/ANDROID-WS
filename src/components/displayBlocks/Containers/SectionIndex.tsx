import React, {FunctionComponent} from 'react';
import HorizontalScrollableSection from './HorizontalScrollableSection';
import PassiveContainer from './PassiveContainer';
import VerticalScrollableSection from './VerticalScrollableSection';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
const isMobile = width < 768;

const SectionIndex: {[key: string]: FunctionComponent<any>} = {
  title_subtitle_section: isMobile
    ? VerticalScrollableSection
    : HorizontalScrollableSection,
  prescription_section: PassiveContainer,
  previous_order_section: HorizontalScrollableSection,
  brands_section: HorizontalScrollableSection,
};

export default SectionIndex;
