import {TextStyle, ViewStyle} from 'react-native';

export type ToastProfileType = {
  title: string;
  description?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  icon?: any;
  origin?: string;
  timeLimit?: number;
};
