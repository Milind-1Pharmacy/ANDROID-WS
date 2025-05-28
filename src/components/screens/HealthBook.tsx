import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  FormControl,
  Select,
  CheckIcon,
  Heading,
  Icon,
  Spinner,
  Modal,
  Radio,
  Divider,
  View,
} from 'native-base';
import {useForm, Controller} from 'react-hook-form';
import DocumentPicker from 'react-native-document-picker';
import {
  CameraOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {AuthContext} from '@contextProviders';
import {getURL} from '@APIRepository';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faPlus,
  faMagnifyingGlass,
  faCheck,
  faCamera,
  faUpload,
  faExclamationTriangle,
  faArrowLeft,
  faHeartCircleCheck,
  faSuitcaseMedical,
  faCapsules,
  faPills,
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
  faFileImage,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import {MedicationItem} from '@commonComponents';
import {useNavigation} from '@react-navigation/native';
import {APIGet} from '@APIHandler';

// Types
interface CameraPhoto {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  stripColor: string;
  therapyTag: string;
  isManual: boolean;
  mrp?: string;
  skuId?: string;
  photo?: CameraPhoto;
  imageUrl?: string;
}

interface ProductSearchResult {
  id: string;
  name: string;
  therapy?: string;
  imageUrl?: string;
  mrp?: string;
}

interface NewMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  stripColor: string;
  therapyTag: string;
  isManual: boolean;
  skuId?: string;
  mrp?: string;
  imageUrl?: string;
}

interface UpdateMedication {
  id: string;
  field: keyof Medication;
  value: any;
}

interface HealthParameters {
  height: string;
  weight: string;
  bloodPressure: string;
  bloodSugar: string;
  spo2: string;
  bpPhoto: CameraPhoto | null;
  glucometerPhoto: CameraPhoto | null;
  pulseOximeterPhoto: CameraPhoto | null;
}
// Constants

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

const getFileIcon = (fileName: string, uri?: string) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();

  if (uri && ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
    return (
      <Image
        source={{uri}}
        style={{width: 32, height: 32, borderRadius: 4}}
        resizeMode="cover"
      />
    );
  }

  switch (extension) {
    case 'pdf':
      return <FontAwesomeIcon icon={faFilePdf} color="#FF0000" size={20} />;
    case 'doc':
    case 'docx':
      return <FontAwesomeIcon icon={faFileWord} color="#2B579A" size={20} />;
    case 'xls':
    case 'xlsx':
      return <FontAwesomeIcon icon={faFileExcel} color="#217346" size={20} />;
    case 'txt':
      return <FontAwesomeIcon icon={faFileAlt} color="#000" size={20} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FontAwesomeIcon icon={faFileImage} color="#4CAF50" size={20} />;
    default:
      return <FontAwesomeIcon icon={faFile} color="#666" size={20} />;
  }
};

const useDebounce = <T,>({value, delay}: {value: T; delay: number}): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const HealthBook = () => {
  // Form control
  const {handleSubmit} = useForm();
  const navigation = useNavigation();
  // State management
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthParameters, setHealthParameters] = useState<{
    height: string;
    weight: string;
    bloodPressure: string;
    bloodSugar: string;
    spo2: string;
    bpPhoto: DocumentPickerResponse | null;
    glucometerPhoto: DocumentPickerResponse | null;
    pulseOximeterPhoto: DocumentPickerResponse | null;
  }>({
    height: '',
    weight: '',
    bloodPressure: '',
    bloodSugar: '',
    spo2: '',
    bpPhoto: null,
    pulseOximeterPhoto: null,
    glucometerPhoto: null,
  });

  const [healthRecords, setHealthRecords] = useState<{
    files: DocumentPickerResponse[];
  }>({files: []});

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debouncedSearchQuery: string = useDebounce<string>({
    value: searchQuery,
    delay: 300,
  });
  const performSearchRef = useRef<NodeJS.Timeout>();

  // Manual medication state
  const [manualMedication, setManualMedication] = useState({
    name: '',
    mrp: '',
    composition: '',
  });

  // Modal states
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Context
  const {storeId} = useContext(AuthContext);

  // Search functionality

  const performSearch = useCallback(
    async (query: string) => {
      // Clear previous timeout
      if (performSearchRef.current) {
        clearTimeout(performSearchRef.current);
      }

      if (query.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Debounce the actual API call
      performSearchRef.current = setTimeout(async () => {
        const url = getURL({
          key: 'SEARCH_PRODUCT',
          pathParams: storeId || '',
          queryParams: {search: query},
        });
        APIGet({
          url: url,
          resolve: (response: any) => {
            if (!response.data) {
              throw response;
            }

            const products = response.data?.products || [];
            setSearchResults(products);
            setIsSearching(false);
          },
          reject: (error: any) => {
            console.error('Search error:', error);
            setSearchResults([]);
            setIsSearching(false);
            Alert.alert(
              'Error',
              'Failed to search products. Please try again.',
            );
          },
        });
      }, 300); // Additional debounce
    },
    [storeId],
  );

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, performSearch]);

  useEffect(() => {
    return () => {
      if (performSearchRef.current) {
        clearTimeout(performSearchRef.current);
      }
    };
  }, []);

  // Medication management

  const addMedicationFromSearch = useCallback(
    (product: ProductSearchResult) => {
      // Check for duplicate first to avoid unnecessary work
      if (medications.some(m => m.skuId === product.id)) {
        setSearchQuery('');
        setSearchResults([]);
        return;
      }

      const newMedication: NewMedication = {
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

      // Batch all state updates
      setMedications(prev => [...prev, newMedication]);
      setSearchQuery('');
      setSearchResults([]);
    },
    [medications], // Add medications dependency
  );

  const addManualMedication = useCallback(() => {
    if (!manualMedication.name.trim()) {
      Alert.alert('Error', 'Please enter a medicine name');
      return;
    }

    const newMedication = {
      id: Date.now().toString(),
      name: manualMedication.name,
      dosage: '',
      frequency: 'once',
      stripColor: STRIP_COLORS[0],
      therapyTag: '',
      isManual: true,
      mrp: manualMedication.mrp,
    };

    setMedications(prev => [...prev, newMedication]);
    setManualMedication({name: '', mrp: '', composition: ''});
  }, [manualMedication]);

  const handleUpdateMedication = useCallback(
    ({id, field, value}: UpdateMedication) => {
      setMedications(prev =>
        prev.map(med => (med.id === id ? {...med, [field]: value} : med)),
      );
    },
    [],
  );

  const handleRemoveMedication = useCallback((id: any) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  }, []);

  const cameraOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.8,
    cameraType: 'back',
    saveToPhotos: true,
    includeBase64: false,
    presentationStyle: 'fullScreen', // Important for Android
    durationLimit: 30,
    maxWidth: 1024, // Limits image size
    maxHeight: 1024,
  };

  const launchCameraForPhoto = useCallback(
    async (
      type: 'bpMonitor' | 'glucometer' | 'pulseOximeter' | 'medicineStrip',
      medicationId?: string,
    ) => {
      try {
        // First, check if we have camera permission
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

        // Launch camera with proper options
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

        const photo = {
          uri: result.assets[0].uri || '',
          fileName: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
          type: result.assets[0].type || 'image/jpeg',
          fileSize: result.assets[0].fileSize || 0,
        };

        // Update state based on photo type
        if (type === 'medicineStrip' && medicationId) {
          handleUpdateMedication({
            id: medicationId,
            field: 'photo',
            value: photo,
          });
        } else {
          setHealthParameters(prev => ({
            ...prev,
            ...(type === 'bpMonitor' && {
              bpPhoto: {
                name: photo.fileName || '',
                fileCopyUri: photo.uri || '',
                size: photo.fileSize || 0,
                type: photo.type || '',
                uri: photo.uri || '',
              },
            }),
            ...(type === 'glucometer' && {
              glucometerPhoto: {
                name: photo.fileName || '',
                fileCopyUri: photo.uri || '',
                size: photo.fileSize || 0,
                type: photo.type || '',
                uri: photo.uri || '',
              },
            }),
            ...(type === 'pulseOximeter' && {
              pulseOximeterPhoto: {
                name: photo.fileName || '',
                fileCopyUri: photo.uri || '',
                size: photo.fileSize || 0,
                type: photo.type || '',
                uri: photo.uri || '',
              },
            }),
          }));
        }

        Alert.alert('Success', 'Photo captured successfully');
      } catch (err) {
        console.error('Camera error:', err);
        Alert.alert('Error', 'Failed to access camera');
      }
    },
    [handleUpdateMedication],
  );

  const handlePhotoUpload = useCallback(
    (type: string, medicationId: string | null = null) => {
      if (type === 'medicineStrip' && medicationId) {
        launchCameraForPhoto('medicineStrip', medicationId);
      } else if (type === 'bpMonitor') {
        launchCameraForPhoto('bpMonitor');
      } else if (type === 'glucometer') {
        launchCameraForPhoto('glucometer');
      } else if (type === 'pulseOximeter') {
        launchCameraForPhoto('pulseOximeter');
      }
    },
    [launchCameraForPhoto],
  );

  const handleFileUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });

      const filesWithUri = result
        .map(file => ({
          ...file,
          uri: file.uri || file.fileCopyUri || '', // Ensure uri is always a string
        }))
        .filter(file => file.uri); // Filter out files with empty uri

      setHealthRecords(prev => ({
        files: [...prev.files, ...filesWithUri] as DocumentPickerResponse[], // Cast to DocumentPickerResponse[]
      }));

      Alert.alert('Success', 'Files uploaded successfully');
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('File upload error:', err);
        Alert.alert('Error', 'Failed to upload files');
      }
    }
  }, []);

  // Consent handling for blood sugar
  const handleBloodSugarConsent = useCallback(() => {
    setShowConsentModal(true);
  }, []);

  const acceptConsent = useCallback(() => {
    setShowConsentModal(false);
    // Allow blood sugar input
  }, []);

  // Validation
  const validateMedications = useCallback(() => {
    return medications.every(
      med => med.dosage.trim() !== '' && med.frequency !== '',
    );
  }, [medications]);

  // Form submission
  const onSubmit = useCallback(
    (data: any) => {
      if (medications.length === 0) {
        Alert.alert('Error', 'Please add at least one medication');
        return;
      }

      if (!validateMedications()) {
        Alert.alert('Error', 'Please complete all medication details');
        return;
      }

      const finalData = {
        medications,
        healthParameters,
        healthRecords: healthRecords.files,
        ...data,
      };

      console.log('Final Health Book Data:', finalData);
      Alert.alert('Success', 'Health book submitted successfully!');
    },
    [medications, healthParameters, healthRecords, validateMedications],
  );

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

  // Render functions
  const renderSearchResults = useMemo(() => {
    if (!searchResults?.length) return null;

    return (
      <Box
        maxHeight="200"
        borderWidth={1}
        borderColor="gray.200"
        borderRadius={8}>
        <ScrollView
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}>
          {searchResults.map(item => (
            <SearchResultItem
              key={item.id}
              item={item}
              onPress={addMedicationFromSearch}
            />
          ))}
        </ScrollView>
      </Box>
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
    ({item}: {item: Medication}) => (
      <MedicationItem
        item={item}
        onUpdateMedication={handleUpdateMedication}
        onRemoveMedication={handleRemoveMedication}
        onPhotoUpload={handlePhotoUpload}
        renderColorPicker={renderColorPicker}
      />
    ),
    [
      handleUpdateMedication,
      handleRemoveMedication,
      handlePhotoUpload,
      renderColorPicker,
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
          scrollEnabled={true} // Changed from false to true to enable scrolling
          horizontal={true} // Explicitly set to true for horizontal scrolling
          showsHorizontalScrollIndicator={true} // Show scroll indicator
          removeClippedSubviews={false}
          maxToRenderPerBatch={3}
          initialNumToRender={3}
          windowSize={2}
          contentContainerStyle={{paddingRight: 16}} // Add some padding at the end
          getItemLayout={(data, index) => ({
            length: 300, // Adjusted width of each medication item
            offset: 300 * index,
            index,
          })}
        />
      </Box>
    );
  }, [medications, renderMedicationItem]);

  const renderConsentModal = () => (
    <Modal isOpen={showConsentModal} onClose={() => setShowConsentModal(false)}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Measurement Consent</Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <HStack alignItems="center" space={2}>
              <Icon
                as={<FontAwesomeIcon icon={faExclamationTriangle} />}
                color="amber.500"
              />
              <Text style={{color: 'gray'}}>Important Notice</Text>
            </HStack>
            <Text style={{color: 'gray'}}>
              Blood sugar measurement requires a small blood sample. Please
              ensure:
            </Text>
            <VStack space={1} ml={4}>
              <Text style={{color: 'gray'}}>
                • Clean hands and testing area
              </Text>
              <Text style={{color: 'gray'}}>• Use a sterile lancet</Text>
              <Text style={{color: 'gray'}}>
                • Follow your glucometer instructions
              </Text>
              <Text style={{color: 'gray'}}>
                • Consult healthcare provider for interpretation
              </Text>
            </VStack>
            <Text style={{color: 'gray'}}>
              This is for monitoring purposes only. Consult your doctor for
              medical advice.
            </Text>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={() => setShowConsentModal(false)}>
              Cancel
            </Button>
            <Button onPress={acceptConsent}>I Understand</Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#f8f9fa'}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          backgroundColor: '#f8f9fa',
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
          width: '100%',
          height: 72, // optional: give height to align items properly
          paddingVertical: 6,
        }}>
        <TouchableOpacity
          onPress={() => {
            // Handle back navigation
            navigation.goBack();
          }}
          style={{
            position: 'absolute',
            left: 16,
            padding: 8,
            backgroundColor: '#efefef',
            borderRadius: 25,
          }}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="teal" />
        </TouchableOpacity>

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontSize: 24,
              color: 'teal',
              fontWeight: 'bold',
              lineHeight: 32,
            }}>
            Health Book
          </Text>
          <FontAwesomeIcon
            icon={faSuitcaseMedical}
            size={32}
            style={{color: 'teal', position: 'relative', top: -2, left: 10}}
          />
        </View>
      </View>
      <Box p={4}>
        {/* Current Medication Section */}
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

          {/* Search Box */}
          <FormControl mb={1}>
            {/* <FormControl.Label style={{marginBottom: 6}}>
              Search & Add SKU -
            </FormControl.Label> */}
            <Input
              placeholder="Search medications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
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

          {/* Search Results */}
          {searchResults.length > 0 && renderSearchResults}

          {/* Manual Entry Section */}
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
                  placeholder="Enter  name"
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

              <FormControl>
                <FormControl.Label>Composition (Optional)</FormControl.Label>
                <Input
                  value={manualMedication.composition}
                  onChangeText={text =>
                    setManualMedication(prev => ({...prev, composition: text}))
                  }
                  placeholder="Enter composition for search"
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

          {/* Added Medications */}
          {renderedMedications}
        </Box>

        {/* Health Parameters Section */}
        <Box mb={6}>
          <Heading fontSize="lg" mb={4} color="gray.700">
            📂 Capture Health Parameters
          </Heading>

          <VStack space={4}>
            <HStack space={4}>
              <FormControl flex={1}>
                <FormControl.Label>Height (cm)</FormControl.Label>
                <Input
                  keyboardType="numeric"
                  value={healthParameters.height}
                  onChangeText={text =>
                    setHealthParameters(prev => ({...prev, height: text}))
                  }
                  placeholder="170"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormControl.Label>Weight (kg)</FormControl.Label>
                <Input
                  keyboardType="numeric"
                  value={healthParameters.weight}
                  onChangeText={text =>
                    setHealthParameters(prev => ({...prev, weight: text}))
                  }
                  placeholder="70"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormControl.Label>Blood Pressure (mmHg)</FormControl.Label>
              <Input
                value={healthParameters.bloodPressure}
                onChangeText={text =>
                  setHealthParameters(prev => ({...prev, bloodPressure: text}))
                }
                placeholder="120/80"
              />
              <Button
                variant="outline"
                size="sm"
                mt={2}
                leftIcon={
                  <Icon
                    as={
                      <FontAwesomeIcon
                        icon={faCamera}
                        style={{color: '#fff'}}
                      />
                    }
                  />
                }
                onPress={() => launchCameraForPhoto('bpMonitor')}
                style={{
                  backgroundColor: '#2e6acf',
                  borderColor: '#2e6acf',
                }}
                _text={{color: 'white'}}
                _pressed={{
                  backgroundColor: '#1f4cab',
                  borderColor: '#1f4cab',
                }}>
                Capture BP Monitor Reading
              </Button>
              {healthParameters.bpPhoto && (
                <HStack alignItems="center" mt={2} space={2}>
                  <Image
                    source={{uri: healthParameters.bpPhoto.uri}}
                    style={{width: 32, height: 32, borderRadius: 4}}
                  />
                  <Text>namw</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setHealthParameters(prev => ({...prev, bpPhoto: null}))
                    }>
                    <FontAwesomeIcon icon={faTimesCircle} color="red" />
                  </TouchableOpacity>
                </HStack>
              )}
            </FormControl>

            <FormControl>
              <FormControl.Label>Random Blood Sugar (mg/dL)</FormControl.Label>
              <Input
                value={healthParameters.bloodSugar}
                onChangeText={text =>
                  setHealthParameters(prev => ({...prev, bloodSugar: text}))
                }
                placeholder="110"
                keyboardType="numeric"
                onFocus={handleBloodSugarConsent}
              />
              <Button
                variant="outline"
                size="sm"
                mt={2}
                leftIcon={
                  <Icon
                    as={
                      <FontAwesomeIcon
                        icon={faCamera}
                        style={{color: '#fff'}}
                      />
                    }
                  />
                }
                style={{
                  backgroundColor: '#2e6acf',
                  borderColor: '#2e6acf',
                }}
                _text={{color: 'white'}}
                _pressed={{
                  backgroundColor: '#1f4cab',
                  borderColor: '#1f4cab',
                }}
                onPress={() => handlePhotoUpload('glucometer')}>
                Capture Glucometer Reading
              </Button>
              {healthParameters.glucometerPhoto && (
                <HStack alignItems="center" mt={2} space={2}>
                  <Image
                    source={{uri: healthParameters.glucometerPhoto.uri}}
                    style={{width: 32, height: 32, borderRadius: 4}}
                  />
                  <Text>{healthParameters.glucometerPhoto.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setHealthParameters(prev => ({
                        ...prev,
                        glucometerPhoto: null,
                      }))
                    }>
                    <FontAwesomeIcon icon={faTimesCircle} color="red" />
                  </TouchableOpacity>
                </HStack>
              )}
            </FormControl>

            <FormControl>
              <FormControl.Label>SPO2 (%)</FormControl.Label>
              <Input
                value={healthParameters.spo2}
                onChangeText={text =>
                  setHealthParameters(prev => ({...prev, spo2: text}))
                }
                placeholder="98"
                keyboardType="numeric"
              />
              <Button
                variant="outline"
                size="sm"
                mt={2}
                leftIcon={
                  <Icon
                    as={
                      <FontAwesomeIcon
                        icon={faCamera}
                        style={{color: '#fff'}}
                      />
                    }
                  />
                }
                style={{
                  backgroundColor: '#2e6acf',
                  borderColor: '#2e6acf',
                }}
                _text={{color: 'white'}}
                _pressed={{
                  backgroundColor: '#1f4cab',
                  borderColor: '#1f4cab',
                }}
                onPress={() => handlePhotoUpload('pulseOximeter')}>
                Capture Pulse Oximeter Reading
              </Button>
              {healthParameters.pulseOximeterPhoto && (
                <HStack alignItems="center" mt={2} space={2}>
                  <Image
                    source={{uri: healthParameters.pulseOximeterPhoto.uri}}
                    style={{width: 32, height: 32, borderRadius: 4}}
                  />
                  <Text>{healthParameters.pulseOximeterPhoto.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setHealthParameters(prev => ({
                        ...prev,
                        pulseOximeterPhoto: null,
                      }))
                    }>
                    <FontAwesomeIcon icon={faTimesCircle} color="red" />
                  </TouchableOpacity>
                </HStack>
              )}
            </FormControl>
          </VStack>
        </Box>

        <Divider mb={6} />

        {/* Health Records Section */}
        <Box mb={6}>
          <Heading fontSize="lg" mb={4} color="gray.700">
            📂 Upload Health Records
          </Heading>

          <Button
            onPress={handleFileUpload}
            variant="solid"
            bg="#2e6acf"
            _text={{color: '#fff'}}
            _pressed={{bg: '#1f4cab'}}
            shadow={2}
            mb={4}>
            📤 Upload Reports (Image or PDF)
          </Button>

          {healthRecords.files.length > 0 && (
            <Box>
              <Text>Uploaded Files ({healthRecords.files.length})</Text>
              <VStack space={2}>
                {healthRecords.files.map((file, index) => (
                  <Box
                    key={index}
                    p={2}
                    borderWidth={1}
                    borderColor="gray.200"
                    borderRadius={6}
                    position="relative">
                    <HStack alignItems="center" space={2}>
                      {getFileIcon(file.name ?? '', file.uri)}
                      <VStack flex={1}>
                        <Text numberOfLines={1} ellipsizeMode="tail">
                          {file?.name ?? 'file'}
                        </Text>
                        <Text>{((file?.size ?? 0) / 1024).toFixed(1)} KB</Text>
                      </VStack>
                    </HStack>
                    <TouchableOpacity
                      onPress={() => {
                        setHealthRecords(prev => ({
                          files: prev.files.filter((_, i) => i !== index),
                        }));
                      }}
                      style={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        padding: 4,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: 12,
                      }}>
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        color="red"
                        size={16}
                      />
                    </TouchableOpacity>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          colorScheme="teal"
          size="lg"
          isDisabled={medications.length === 0}
          leftIcon={<Icon as={<FontAwesomeIcon icon={faCheck} />} />}>
          Submit Health Book
        </Button>

        {/* Consent Modal */}
        {renderConsentModal()}
      </Box>
    </ScrollView>
  );
};

export default HealthBook;
