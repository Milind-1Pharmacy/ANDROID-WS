import {CardsIndex} from '@HouseOfCards';
import {RootStackParamList} from 'App';

type ItemTypeProfile = {
  getURLKey: string;
  screenTitle: string;
  cardId: keyof typeof CardsIndex;
  cardPropParser: Function;
  itemNavigateTo: keyof RootStackParamList;
  navigateParams: Function;
};

const ItemTypeProfiles: {[key: string]: ItemTypeProfile} = {
  category: {
    getURLKey: 'CATEGORY',
    screenTitle: 'Categories',
    cardId: 'card_12',
    cardPropParser: (item: any) => item,
    itemNavigateTo: 'ItemsListing',
    navigateParams: (category: any) => ({
      listBy: 'category',
      type: category.id,
    }),
  },
  brand: {
    getURLKey: 'BRAND',
    screenTitle: 'Brands',
    cardId: 'card_12',
    cardPropParser: (item: any) => item,
    itemNavigateTo: 'ItemsListing',
    navigateParams: (category: any) => ({
      listBy: 'category',
      type: category.id,
    }),
  },
};

export default ItemTypeProfiles;
