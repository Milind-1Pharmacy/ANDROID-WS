import React, {useCallback, useState, useMemo, useContext} from 'react';
import {
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ScrollView,
  View,
  PermissionsAndroid,
} from 'react-native';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  FormControl,
  Icon,
  Spinner,
  Heading,
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faPlus,
  faMagnifyingGlass,
  faExclamationTriangle,
  faPills,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import {MedicationItem} from '@commonComponents';
import {
  ProductSearchResult,
  Medication,
  UpdateMedication,
  AddMedicationFormProps,
  ManualMedicationState,
  PhotoType,
} from '../types';
import {getURL} from '@APIRepository';
import {APIGet} from '@APIHandler';
import {CameraOptions, launchCamera, Asset} from 'react-native-image-picker';
import {AuthContext} from '@contextProviders';

const STRIP_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

const AddMedicationForm: React.FC<AddMedicationFormProps> = ({
  initialData = [],
  onSubmit,
  onCancel,
}) => {
  const [medications, setMedications] = useState<Medication[]>(initialData);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [manualMedication, setManualMedication] =
    useState<ManualMedicationState>({
      name: '',
      mrp: '',
      composition: '',
    });
  // Track the initial count to identify newly added medications
  const [initialMedicationCount] = useState(initialData.length);

  const {storeId} = useContext(AuthContext);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(medications);
    } catch (error) {
      console.error('Failed to update medications:', error);
      Alert.alert('Error', 'Failed to save medications. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [medications, onSubmit]);

  const performSearch = useCallback(
    async (query: string) => {
      console.log('performSearch called with query:', query); // Debug log
      if (query.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const url = getURL({
          key: 'SEARCH_PRODUCT',
          pathParams: storeId || '',
          queryParams: {search: query},
        });
        console.log('Making API call to:', url); // Debug log
        const response = await APIGet({url});
        console.log('API response:', response); // Debug log
        const products = response.data?.products || [];
        setSearchResults(products);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        Alert.alert('Error', 'Failed to search products. Please try again.');
      } finally {
        setIsSearching(false);
      }
    },
    [storeId],
  );

  // Add debounce to prevent too many API calls
  const debouncedSearch = useMemo(() => {
    let timer: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        performSearch(query);
      }, 500); // 500ms debounce delay
    };
  }, [performSearch]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text.length >= 3) {
        debouncedSearch(text);
      } else {
        setSearchResults([]);
      }
    },
    [debouncedSearch],
  );

  const addMedicationFromSearch = useCallback(
    (product: ProductSearchResult) => {
      if (medications.some(m => m.skuId === product.id)) {
        setSearchQuery('');
        setSearchResults([]);
        return;
      }

      const newMedication: Medication = {
        id: `${Date.now()}`,
        name: product.name,
        dosage: '',
        frequency: 'once',
        stripColor: STRIP_COLORS[0],
        therapyTag: product.therapy || '',
        isManual: false,
        skuId: product.id,
        mrp: product.mrp,
        imageUrl: product.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK,
      };

      setMedications(prev => {
        // Add new medication at the beginning of the array
        const previousMedications = Array.isArray(prev) ? prev : [];
        return [newMedication, ...previousMedications];
      });
      setSearchQuery('');
      setSearchResults([]);
    },
    [medications],
  );

  const addManualMedication = useCallback(() => {
    if (!manualMedication.name.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: manualMedication.name,
      dosage: '',
      frequency: 'once',
      stripColor: STRIP_COLORS[0],
      therapyTag: '',
      isManual: true,
      mrp: manualMedication.mrp,
      imageUrl: TABLET_CAPSULE_IMAGE_FALLBACK,
    };

    setMedications(prev => {
      // Add new medication at the beginning of the array
      const previousMedications = Array.isArray(prev) ? prev : [];
      return [newMedication, ...previousMedications];
    });
    setManualMedication({name: '', mrp: '', composition: ''});
  }, [manualMedication]);

  const handleUpdateMedication = useCallback(
    ({id, field, value}: UpdateMedication) => {
      setMedications(prev => {
        const previousMedications = Array.isArray(prev) ? prev : [];
        return previousMedications.map(med =>
          med.id === id ? {...med, [field]: value} : med,
        );
      });
    },
    [],
  );

  const cameraOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    cameraType: 'back',
    saveToPhotos: true,
    includeBase64: false,
    presentationStyle: 'fullScreen',
    durationLimit: 30,
    maxWidth: 1024,
    maxHeight: 1024,
  };

  const launchCameraForPhoto = useCallback(
    async (medicationId: string) => {
      try {
        const cameraPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (!cameraPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'App needs access to your camera',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Camera permission is required');
            return;
          }
        }

        const result = await launchCamera(cameraOptions);

        if (result.didCancel) {
          console.log('User cancelled camera');
          return;
        }

        if (result.errorCode) {
          console.error('Camera Error:', result.errorMessage);
          Alert.alert('Error', 'Failed to take photo');
          return;
        }

        if (!result.assets || result.assets.length === 0) {
          console.error('No assets in camera result');
          return;
        }

        const asset = result.assets[0];
        const photo: PhotoType = {
          uri: asset.uri || '',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          fileSize: asset.fileSize || 0,
        };

        handleUpdateMedication({
          id: medicationId,
          field: 'photo',
          value: photo,
        });

        Alert.alert('Success', 'Photo captured successfully');
      } catch (err) {
        console.error('Camera error:', err);
        Alert.alert('Error', 'Failed to access camera');
      }
    },
    [handleUpdateMedication],
  );

  const handleRemoveMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  }, []);

  const SearchResultItem = React.memo(
    ({
      item,
      onPress,
    }: {
      item: ProductSearchResult;
      onPress: (item: ProductSearchResult) => void;
    }) => (
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
        style={{backgroundColor: 'transparent'}}>
        <Box p={3} borderBottomWidth={1} borderBottomColor="gray.200">
          <HStack justifyContent="space-between" alignItems="center">
            <Image
              source={{
                uri: item.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK,
              }}
              alt={item.name || 'Medication'}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                marginRight: 8,
              }}
              resizeMode="cover"
            />
            <VStack flex={1}>
              <Text style={{color: 'black'}} numberOfLines={1}>
                {item.name}
              </Text>
            </VStack>
            <Icon
              as={
                <FontAwesomeIcon
                  icon={faPlus}
                  style={{
                    color: '#2E6ACF',
                    backgroundColor: '#EFEFEF',
                    padding: 10,
                    borderRadius: 8,
                  }}
                />
              }
            />
          </HStack>
        </Box>
      </TouchableOpacity>
    ),
  );

  const renderSearchResults = useMemo(() => {
    if (!searchResults?.length) return null;

    return (
      <View
        style={{
          height: Math.min(searchResults.length * 60, 200), // Dynamic height based on items
          // maxHeight: 200,
          borderWidth: 1,
          borderColor: '#E5E5E5',
          borderRadius: 8,
          backgroundColor: 'white',
        }}>
        <ScrollView
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          contentContainerStyle={{
            flexGrow: 1,
          }}>
          {searchResults.map(item => (
            <SearchResultItem
              key={item.id}
              item={item}
              onPress={addMedicationFromSearch}
            />
          ))}
        </ScrollView>
      </View>
    );
  }, [searchResults, addMedicationFromSearch]);

  const renderColorPicker = useCallback(
    (selectedColor: string, onColorSelect: (color: string) => void) => (
      <HStack flexWrap="wrap" space={2} mt={2}>
        {STRIP_COLORS.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => onColorSelect(color)}
            style={{
              width: 30,
              height: 30,
              backgroundColor: color,
              borderRadius: 15,
              borderWidth: selectedColor === color ? 3 : 1,
              borderColor: selectedColor === color ? '#000' : '#ccc',
              margin: 2,
            }}
          />
        ))}
      </HStack>
    ),
    [],
  );

  const renderMedicationItem = useCallback(
    ({item, index}: {item: Medication; index: number}) => (
      <View
        key={item.id}
        style={{
          marginRight: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Show "Added" indicator for newly added medications */}
        {index < medications.length - initialMedicationCount && (
          <View
            style={{
              // borderRadius: 4,
              // alignSelf: 'flex-start',
              marginBottom: 8,
              width: '100%',
              justifyContent: 'center',
              // alignItems: 'center',
              // marginHorizontal: 'auto',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#10B981',
                width: '96%',
                borderRadius: 8,
                paddingVertical: 2,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 13,
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '80%',
                  alignItems: 'center',
                }}>
                Added
              </Text>
            </View>
          </View>
        )}
        <MedicationItem
          item={item}
          onUpdateMedication={handleUpdateMedication}
          onRemoveMedication={handleRemoveMedication}
          renderColorPicker={renderColorPicker}
          onPhotoUpload={launchCameraForPhoto}
        />
      </View>
    ),
    [
      medications.length,
      initialMedicationCount,
      handleUpdateMedication,
      handleRemoveMedication,
      renderColorPicker,
      launchCameraForPhoto,
    ],
  );

  const renderedMedications = useMemo(() => {
    if (medications.length === 0) return null;

    return (
      <Box mt={6}>
        <Heading size="sm" mb={3}>
          Added Medications ({medications.length})
        </Heading>
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={item => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{
            paddingRight: 16,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
          nestedScrollEnabled
        />
      </Box>
    );
  }, [medications, renderMedicationItem]);

  return (
    <ScrollView
      style={{flex: 1, padding: 16}}
      nestedScrollEnabled={true}
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps="handled">
      <Box mb={6}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <FontAwesomeIcon
            icon={faPills}
            size={20}
            style={{color: 'teal', marginRight: 6}}
          />
          <Text style={{fontSize: 18, fontWeight: 'bold', color: 'gray'}}>
            Current Medications
          </Text>
        </View>

        <FormControl mb={1}>
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => performSearch(searchQuery)}
            InputLeftElement={
              isSearching ? (
                <Spinner size="sm" ml={2} />
              ) : (
                <Icon
                  as={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                  size={5}
                  ml="2"
                  color="muted.400"
                />
              )
            }
          />
        </FormControl>

        {renderSearchResults}

        <Box
          mt={3}
          p={4}
          borderWidth={1}
          borderColor="orange.200"
          borderRadius={4}
          bg="orange.50">
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 6,
            }}>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              size={16}
              style={{color: 'orange', marginRight: 6}}
            />
            <Text style={{fontSize: 14, fontWeight: 'bold', color: 'gray'}}>
              SKU Not Found? Add Manually
            </Text>
          </View>

          <VStack space={3}>
            <FormControl>
              <FormControl.Label>Medicine Name</FormControl.Label>
              <Input
                value={manualMedication.name}
                onChangeText={text =>
                  setManualMedication(prev => ({...prev, name: text}))
                }
                placeholder="Enter name"
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>MRP (₹)</FormControl.Label>
              <Input
                value={manualMedication.mrp}
                onChangeText={text =>
                  setManualMedication(prev => ({...prev, mrp: text}))
                }
                placeholder="Enter MRP"
                keyboardType="numeric"
              />
            </FormControl>

            <Button
              onPress={addManualMedication}
              colorScheme="orange"
              leftIcon={<Icon as={<FontAwesomeIcon icon={faPlus} />} />}>
              Add Medication
            </Button>
          </VStack>
        </Box>

        {renderedMedications}
      </Box>

      <HStack space={4} justifyContent="flex-end" mt={6}>
        {onCancel && (
          <Button variant="outline" onPress={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onPress={handleSubmit}
          colorScheme="teal"
          isLoading={isSubmitting}
          leftIcon={<Icon as={<FontAwesomeIcon icon={faCheck} />} />}
          isDisabled={medications.length === 0}>
          Save Changes
        </Button>
      </HStack>
    </ScrollView>
  );
};

export default AddMedicationForm;
