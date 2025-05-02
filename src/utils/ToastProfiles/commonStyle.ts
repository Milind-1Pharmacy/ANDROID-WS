import {StyleSheet} from 'react-native';

const ToastBaseStyle = StyleSheet.create({
  toast: {
    borderRadius: 8, // More rounded corners
    paddingVertical: 16,
    paddingHorizontal: 15,
    flexDirection: 'row', // Aligns text & icon
    alignItems: 'center',
    minWidth: 320, // Ensures width consistency
    maxWidth: '96%',
    elevation: 5, // Shadow effect
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 32,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10, // Space between icon & text
    flexShrink: 1, // Prevents overflow
  },
});

export default ToastBaseStyle;
