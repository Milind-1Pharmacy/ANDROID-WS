import {startTransition, useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Button, Select, Divider} from 'native-base';
import {AuthContext, FormStateContext, ToastContext} from '@contextProviders';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from 'App';
import {getCartTotalCalculator} from '@helpers';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {RUPEE_SYMBOL} from '@Constants';
import {
  faCartShopping as faCartShoppingSolid,
  faCaretDown,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import {ToastProfiles} from '@ToastProfiles';
import { useContextSelector } from 'use-context-selector';
import React from 'react';


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B81F6',
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginHorizontal: 'auto',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    maxWidth: 300,
    overflow: 'hidden',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#999',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EFEFEF',
    marginBottom: 16,
    textAlign: 'center',
  },
  viewCartButton: {
    marginBottom: 16,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 8, // Adjusts dynamic height
    paddingHorizontal: 8,
  },
  viewCartButtonText: {
    fontSize: 12,
    color: '#2E6ACF',
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'relative',
    top: -2,
  },
  cartList: {
    paddingBottom: 20,
  },
  cartItemContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
    paddingTop: 4,
    elevation: 5, // Adds a shadow on Android
    shadowColor: '#000', // Shadow color
    shadowOffset: {width: 0, height: 2}, // Shadow direction and distance
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 'auto',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 12,
    color: '#2E6ACF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  selectAndButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Adds space between Select and Button
  },
  customQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customQuantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    maxWidth: 60,
  },
  updateButton: {
    backgroundColor: '#2E6ACF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});

const SideCart = ({items}: {items: any[]}) => {
  const {cart, updateCart} = useContextSelector(FormStateContext, state => ({
    cart: state.cart,
    updateCart: state.updateCart
  }));
  const {showToast} = useContext(ToastContext);
  const {appMode} = useContext(AuthContext);
  const {totalAmount} = cart;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cartTotalCalculator = getCartTotalCalculator(appMode as string);

  // State to track the selected label for each item
  const [labels, setLabels] = useState<{[key: string]: string}>({});

  // State to track custom quantity mode for each item
  const [isCustomQuantityMode, setIsCustomQuantityMode] = useState<{
    [key: string]: boolean;
  }>({});

  if (!items || items.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartText}>Your cart is empty!</Text>
      </View>
    );
  }

  const removeItemFromCart = (item: any) => {
    const updatedCartItems = cart.items.filter(
      (cartItem: any) => cartItem.id !== item.id,
    );
    updateCart({
      items: updatedCartItems,
      totalAmount: cartTotalCalculator(updatedCartItems),
    });
  };

  const handleQuantityChange = (item: any, value: string) => {
    // Update the label state for the specific item
    setLabels(prev => ({...prev, [item.id]: value}));

    if (value === '10') {
      // Enter custom quantity mode for this item
      setIsCustomQuantityMode(prev => ({...prev, [item.id]: true}));
      return;
    }

    // Exit custom quantity mode if the user selects a value other than 10+
    setIsCustomQuantityMode(prev => ({...prev, [item.id]: false}));

    // Handle quantity change logic
    const updatedCartItems = [...cart.items];
    const itemIndex = updatedCartItems.findIndex(
      cartItem => cartItem.id === item.id,
    );

    if (value === '0') {
      // Remove the item if value is 0
      updatedCartItems.splice(itemIndex, 1);
    } else {
      // Update quantity for the selected value
      updatedCartItems[itemIndex].qty = parseInt(value, 10);
    }

    updateCart({
      items: updatedCartItems,
      totalAmount: cartTotalCalculator(updatedCartItems),
    });
  };

  const handleCustomQuantityChange = (item: any, value: string) => {
    const quantity = parseInt(value, 10);
    const updatedCartItems = [...cart.items];
    const itemIndex = updatedCartItems.findIndex(
      cartItem => cartItem.id === item.id,
    );

    if (!isNaN(quantity) && quantity >= 10) {
      updatedCartItems[itemIndex].qty = quantity;
      updateCart({
        items: updatedCartItems,
        totalAmount: cartTotalCalculator(updatedCartItems),
      });
      // Hide the custom quantity input after updating
      setLabels(prev => ({...prev, [item.id]: quantity.toString()}));

      showToast({
        ...ToastProfiles.success,
        title: 'Item Quantity successfully updated',
      });
    } else {
      // Handle invalid input (e.g., show an error message)
      showToast({
        ...ToastProfiles.error,
        title:
          'Invalid quantity. Please enter a value greater than or equal to 10.',
        timeLimit: 2500,
      });
    }
  };

  const renderCartItem = ({item}: {item: any}) => {
    
    const label = labels[item.id] || item.qty.toString(); // Default to item's current quantity
    const isCustomMode = isCustomQuantityMode[item.id]; // Check if custom mode is active for this item
    return (
      <View style={styles.cartItemContainer}>
        <TouchableOpacity
          onPress={() => {
            startTransition(() =>
              navigation.navigate('ItemDetails', {itemId: item.id}),
            );
          }}>
          <Image
            source={{uri: item.imageUrl}}
            style={styles.itemImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Divider
            style={{backgroundColor: '#eaeaea', height: 1, marginVertical: 4}}
          />
          <Text style={styles.itemPrice}>
            MRP: {RUPEE_SYMBOL}
            {item?.price?.toFixed(2)}
          </Text>
          <View style={styles.quantityContainer}>
            {isCustomMode ? (
              <View>
                <View style={styles.customQuantityContainer}>
                  <TextInput
                    style={styles.customQuantityInput}
                    placeholder="qty"
                    keyboardType="numeric"
                    value={labels[item.id] || ''} // Bind to the specific item.id
                    onChangeText={(value: string) => {
                      if (/^\d*$/.test(value)) {
                        // Update only if the value is numeric
                        setLabels(prev => ({
                          ...prev,
                          [item.id]: value, // Update the value for the specific item.id
                        }));
                      }
                    }}
                  />
                  <Button
                    style={styles.updateButton}
                    onPress={() => {
                      if (labels[item.id] && /^\d+$/.test(labels[item.id])) {
                        handleCustomQuantityChange(item, labels[item.id]); // Use the updated value
                      }
                    }}>
                    <Text style={styles.buttonText}>Update</Text>
                  </Button>
                </View>
                <Button
                  style={styles.removeButton}
                  onPress={() => removeItemFromCart(item)}>
                  <FontAwesomeIcon icon={faTrashCan} size={16} color="#fff" />
                </Button>
              </View>
            ) : (
              <View style={styles.selectAndButtonContainer}>
                <Select
                  selectedValue={label}
                  maxWidth="16" // Set a minimum width for the Select component
                  accessibilityLabel="Choose Quantity"
                  placeholder="Qty"
                  _selectedItem={{
                    bg: '#2E6ACF',
                  }}
                  dropdownIcon={
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      size={16}
                      style={{color: '#2E6ACF', paddingRight: 8}}
                    />
                  }
                  mt={1}
                  onValueChange={value => handleQuantityChange(item, value)}>
                  {[...Array(11).keys()].map(num => (
                    <Select.Item
                      key={num}
                      label={
                        num === 0
                          ? '0 (Remove)'
                          : num === 10
                            ? '10+'
                            : num.toString()
                      }
                      value={num.toString()}
                    />
                  ))}
                </Select>
                <Button
                  style={styles.removeButton}
                  onPress={() => removeItemFromCart(item)}>
                  <FontAwesomeIcon icon={faTrashCan} size={16} color="#fff" />
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cartTotal}>
        Subtotal ({items.length} items): {RUPEE_SYMBOL}
        {totalAmount.toFixed(2)}
      </Text>
      <Button
        style={styles.viewCartButton}
        onPress={() => {
          startTransition(() => {
            navigation.navigate('Cart');
          });
        }}>
        <Text style={styles.viewCartButtonText}>
          Go To Cart
          <FontAwesomeIcon
            icon={faCartShoppingSolid}
            size={16}
            color="#2E6ACF"
            style={{
              marginLeft: 8, // Adds spacing between icon and text
              position: 'relative',
              top: 4,
            }}
          />
        </Text>
      </Button>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        style={styles.cartList}
      />
    </View>
  );
};

export default SideCart;
