import React from 'react';
import GreetingSummaryCard from './GreetingSummaryCard';
import HorizontalDescriptionListCard from './HorizontalDescriptionListCard';
import SectionDescriptionListCard from './SectionDescriptionListCard';
import VerticalDescriptionListCard from './VerticalDescriptionListCard';
import DescItemCard from './DescItemCard';
import ValueTitleBox from './ValueTitleBox';
import ImageDetailsCard from './ImageDetailsCard';
import DescActionsCard from './DescActionsCard';
import KeyValDescCard from './KeyValueDescCard';
import IDActionsCard from './IDActionsCard';
import RoundImageTitleCard from './RoundImageTitleCard';
import ImageTitleCapsuleCard from './ImageTitleCapsuleCard';
import BannerButtonCard from './BannerButtonCard';
import ImageTitleDateCard from './ImageTitleDateCard';
import ProductCounterCard from './ProductCounterCard';
import ImageTitleCard from './ImageTitleCard';
import MProductCounterCard from './MProductCounterCard';
import MImageTitleDateCard from './MImageTitleDateCard';
import MDescItemCard from './MDescItemCard';
import {Dimensions, Platform} from 'react-native';
import MBannerButtonCard from './MBannerButtonCard';

const {width: screenWidth, height} = Dimensions.get('screen');
const isMobileOrTablet = Platform.OS !== 'web' && screenWidth <= 768;

const mobileCardsIndex: {[key: string]: React.FC<any>} = {
  card_5: MDescItemCard,
  card_11: MProductCounterCard,
  product_image_title_date: MImageTitleDateCard,
  card_button_image_text: MBannerButtonCard,
};

const desktopCardsIndex: {[key: string]: React.FC<any>} = {
  card_5: DescItemCard,
  card_11: ProductCounterCard,
  product_image_title_date: ImageTitleDateCard,
  card_button_image_text: BannerButtonCard,
};
const BaseCardsIndex: {[key: string]: React.FC<any>} = {
  card_1: GreetingSummaryCard,
  card_2: HorizontalDescriptionListCard,
  card_3: SectionDescriptionListCard,
  card_4: VerticalDescriptionListCard,
  card_6: ValueTitleBox,
  card_7: ImageDetailsCard,
  card_8: DescActionsCard,
  card_9: KeyValDescCard,
  card_10: IDActionsCard,
  card_12: ImageTitleCard,
  round_image_title: RoundImageTitleCard,
  brands_image_title: ImageTitleCapsuleCard,
  card_button_image_text: BannerButtonCard,
};

const CardsIndex = {
  ...BaseCardsIndex,
  ...(isMobileOrTablet ? mobileCardsIndex : desktopCardsIndex),
};

const getCardByIndex = (cardId: string): React.FC => {
  if (!!CardsIndex[cardId]) {
    return CardsIndex[cardId];
  } else {
    return () => <></>;
  }
};

export {getCardByIndex};

export default CardsIndex;
