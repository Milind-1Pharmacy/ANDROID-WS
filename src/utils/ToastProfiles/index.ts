import ToastBaseProfiles from './common';
import ToastBaseStyle from './commonStyle';

const getCustomToastProfile = ({
  title,
  description,
  template,
  icon,
  origin,
}: {
  title: string;
  description?: string;
  template: string;
  icon?: any;
  origin?: string;
}) => {
  return {...ToastBaseProfiles[template], title, description, icon, origin};
};

const ToastProfiles = {
  ...ToastBaseProfiles,
};

export {ToastProfiles, ToastBaseStyle, getCustomToastProfile};
