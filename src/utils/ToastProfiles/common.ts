import {StyleSheet} from 'react-native';
import ToastBaseStyle from './commonStyle';
import {ToastProfileType} from './types';
import {faCircleCheck, faCircleXmark} from '@fortawesome/free-solid-svg-icons';

const styles = StyleSheet.create({
  errorToast: {
    backgroundColor: '#ff4d4d', // Softer red
  },
  successToast: {
    backgroundColor: '#28a746', // Softer green
  },
});

const ToastBaseProfiles: {[key: string]: ToastProfileType} = {
  success: {
    title: "You’re in now, no need to wait,\nShop for health and feel great!",
    containerStyle: {...ToastBaseStyle.toast, ...styles.successToast},
    titleStyle: ToastBaseStyle.toastText,
    icon: faCircleCheck, // Correctly passing the icon object
    timeLimit: 3000,
  },
  error: {
    title: 'Something went wrong.',
    containerStyle: {...ToastBaseStyle.toast, ...styles.errorToast},
    titleStyle: ToastBaseStyle.toastText,
    icon: faCircleXmark,
  },
};

export default ToastBaseProfiles;
