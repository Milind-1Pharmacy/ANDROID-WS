module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-react'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@utils': './src/utils',
          '@Containers': './src/components/displayBlocks/Containers',
          '@DynamicViewHandler':
            './src/components/displayBlocks/DynamicViewHandler',
          '@HouseOfCards': './src/components/displayBlocks/HouseOfCards',
          '@screens/SearchAddress': './src/components/screens/SearchAddress',
          '@screens/AddressListScreen':
            './src/components/screens/AddressListScreen',
          '@screens/CartScreen': './src/components/screens/CartScreen',
          '@screens/Home': './src/components/screens/Home',
          '@screens/ItemDetails': './src/components/screens/ItemDetails',
          '@screens/LoginScreen': './src/components/screens/LoginScreen',
          '@screens/OrderDetailsScreen':
            './src/components/screens/OrderDetailsScreen',
          '@screens/OrdersListing': './src/components/screens/OrdersListing',
          '@screens/SearchScreen': './src/components/screens/SearchScreen',
          '@screens/SelectLocation': './src/components/screens/SelectLocation',
          '@screens/SupportScreen': './src/components/screens/SupportScreen',
          '@screens/VerifyOTP':
            './src/components/screens/LoginScreen/VerifyOTP',
          '@screens/AddressForm': './src/components/screens/AddressForm',
          '@screens/PrescriptionOrder':
            './src/components/screens/PrescriptionOrder',
          '@screens/ItemsListing': './src/components/screens/ItemsListing',
          '@screens/DynamicGridScreen':
            './src/components/screens/DynamicGridScreen',
          '@screens/RegistrationForm':
            './src/components/screens/RegistrationForm',
          '@EntityHandlers': './src/components/EntityHandlers',
          '@commonComponents': './src/components/commonComponents',
          '@auth': './src/services/auth',
          '@contextProviders': './src/services/contextProviders',
          '@fileHandler': './src/services/fileHandler',
          '@location': './src/services/location',
          '@assets': './src/assets',
          '@ToastProfiles': './src/utils/ToastProfiles',
          '@APIConfig': './src/utils/APIConfig',
          '@APIHandler': './src/services/APIHandler',
          '@APIRepository': './src/utils/APIRepository',
          '@Constants': './src/utils/Constants',
          '@ColorSchemes': './src/utils/ColorSchemes',
          '@helpers': './src/utils/helpers',
          '@P1StyleSheet': './src/utils/P1StyleSheet',
          '@Emitter': './src/utils/Emitter',
          '@Lazy': './src/utils/Lazy',
        },
      },
    ],
    '@babel/plugin-transform-flow-strip-types',
    ['@babel/plugin-transform-private-methods', {loose: true}],
    ['@babel/plugin-transform-class-properties', {loose: true}],
    ['@babel/plugin-transform-private-property-in-object', {loose: true}],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin', // Ensure this is listed last
  ],
  assumptions: {
    setPublicClassFields: true,
    privateFieldsAsProperties: true,
  },
};
