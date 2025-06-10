import React, {useState} from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Box,
  HStack,
  Image,
  Text,
  VStack,
  FormControl,
  Input,
  Button,
  Icon,
  Actionsheet,
  useDisclose,
  Pressable,
  Spinner,
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faCamera,
  faChevronDown,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';
import {CameraOptions, launchCamera} from 'react-native-image-picker';

// Import your types and constants
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
  photo?: any;
  imageUrl?: string;
}

interface UpdateMedication {
  id: string;
  field: keyof Medication;
  value: any;
}

// Constants - you may need to import these from your main file or constants file
const FREQUENCY_OPTIONS = [
  {label: 'Once a day', value: '1'},
  {label: 'Twice a day', value: '2'},
  {label: 'Thrice a day', value: '3'},
  {label: 'Four times a day', value: '4'},
];

const THERAPY_CATEGORIES = [
  'Antidiabetic',
  'Antihypertensive',
  'Antibiotic',
  'Painkiller',
  'Vitamin',
  'Cardiac',
  'Gastric',
  'Respiratory',
];

interface MedicationItemProps {
  item: Medication;
  onUpdateMedication: (update: UpdateMedication) => void;
  onRemoveMedication: (id: string) => void;
  onPhotoUpload: (type: string, medicationId: string | null) => void;
  renderColorPicker: (
    selectedColor: string,
    onColorSelect: (color: string) => void,
  ) => JSX.Element;
}

const MedicationItem: React.FC<MedicationItemProps> = React.memo(
  ({
    item,
    onUpdateMedication,
    onRemoveMedication,
    onPhotoUpload,
    renderColorPicker,
  }) => {
    // console.log('Rendering medication:', item);

    // Action sheet states
    const {
      isOpen: isFrequencyOpen,
      onOpen: onFrequencyOpen,
      onClose: onFrequencyClose,
    } = useDisclose();
    const {
      isOpen: isTherapyOpen,
      onOpen: onTherapyOpen,
      onClose: onTherapyClose,
    } = useDisclose();

    // Get display labels
    const getFrequencyLabel = (value: string) => {
      const option = FREQUENCY_OPTIONS.find(opt => opt.value === value);
      return option ? option.label : 'Select frequency';
    };

    const getTherapyLabel = (value: string) => {
      return value || 'Auto-detected or select';
    };

    const handleFrequencySelect = (value: string) => {
      onUpdateMedication({id: item.id, field: 'frequency', value});
      onFrequencyClose();
    };

    const handleTherapySelect = (value: string) => {
      onUpdateMedication({id: item.id, field: 'therapyTag', value});
      onTherapyClose();
    };

    const [isCameraLoading, setIsCameraLoading] = useState(false);

    // Enhanced camera handler with Xiaomi/Redmi specific fixes
    const handleCameraLaunch = async () => {
      setIsCameraLoading(true);
      try {
        // 1. Check and request permissions
        if (Platform.OS === 'android') {
          // Check if we already have permissions
          const hasCameraPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          const hasStoragePermission = await PermissionsAndroid.check(
            Platform.Version >= 33
              ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
              : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );

          // If we don't have permissions, request them
          if (!hasCameraPermission || !hasStoragePermission) {
            const permissionsToRequest: any = [];
            if (!hasCameraPermission) {
              permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.CAMERA);
            }
            if (!hasStoragePermission) {
              permissionsToRequest.push(
                Platform.Version >= 33
                  ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                  : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              );
            }

            const granted = await PermissionsAndroid.requestMultiple(
              permissionsToRequest,
            );

            // Check if all requested permissions were granted
            const allGranted = Object.values(granted).every(
              result => result === PermissionsAndroid.RESULTS.GRANTED,
            );

            if (!allGranted) {
              Alert.alert(
                'Permissions required',
                'Camera and storage permissions are needed to take photos',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Open Settings',
                    onPress: () => Linking.openSettings(),
                  },
                ],
              );
              return;
            }
          }
        }

        // 2. Special options for Xiaomi/Redmi devices
        const options: CameraOptions = {
          mediaType: 'photo',
          quality: 0.7,
          cameraType: 'back',
          saveToPhotos: true,
          includeBase64: false,
          presentationStyle: 'fullScreen',
          durationLimit: 30,
          maxWidth: 1024,
          maxHeight: 1024,
        };

        // 3. Launch camera
        const result = await launchCamera(options);

        // Handle Xiaomi/Redmi specific issues
        if (Platform.OS === 'android' && !result?.assets) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (!result?.assets) {
            throw new Error('Camera activity was destroyed');
          }
        }

        if (result.didCancel) {
          console.log('User cancelled camera');
          return;
        }

        if (result.errorCode) {
          console.error('Camera Error:', result.errorMessage);
          Alert.alert('Error', result.errorMessage || 'Failed to take photo');
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

        onUpdateMedication({
          id: item.id,
          field: 'photo',
          value: photo,
        });
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert(
          'Error',
          'Failed to capture photo. Please try again.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      } finally {
        setIsCameraLoading(false);
      }
    };
    return (
      <Box
        p={4}
        mb={3}
        width={320}
        mr={3}
        borderRadius={12}
        borderWidth={1}
        borderColor="gray.200"
        bg="white">
        <HStack justifyContent="space-between" alignItems="center" mb={3}>
          <Image
            source={{uri: item.imageUrl || TABLET_CAPSULE_IMAGE_FALLBACK}}
            alt={item.name || 'Medication'}
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              marginRight: 8,
            }}
            resizeMode="cover"
          />
          <VStack flex={1}>
            <Text>{item.name}</Text>
            {item.isManual && <Text>Manual Entry</Text>}
            {item.mrp && <Text>MRP: ₹{item.mrp}</Text>}
          </VStack>
          <TouchableOpacity onPress={() => onRemoveMedication(item.id)}>
            <Icon
              as={<FontAwesomeIcon icon={faTimes} style={{color: '#FF0000'}} />}
            />
          </TouchableOpacity>
        </HStack>

        <VStack space={3}>
          <FormControl isRequired>
            <FormControl.Label>Dosage Frequency</FormControl.Label>
            <Pressable onPress={onFrequencyOpen}>
              <Box
                borderWidth={1}
                borderColor="gray.300"
                borderRadius={4}
                px={3}
                py={3}
                bg="gray.50">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={item.frequency ? 'black' : 'gray.400'}>
                    {getFrequencyLabel(item.frequency)}
                  </Text>
                  <Icon
                    as={<FontAwesomeIcon icon={faChevronDown} />}
                    size="sm"
                    color="gray.400"
                  />
                </HStack>
              </Box>
            </Pressable>
          </FormControl>

          <FormControl isRequired>
            <FormControl.Label>Dosage</FormControl.Label>
            <Input
              value={item.dosage}
              onChangeText={text =>
                onUpdateMedication({id: item.id, field: 'dosage', value: text})
              }
              placeholder="e.g., 1 tablet, 5ml"
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Strip Color</FormControl.Label>
            {renderColorPicker(item.stripColor, color =>
              onUpdateMedication({
                id: item.id,
                field: 'stripColor',
                value: color,
              }),
            )}
          </FormControl>

          <FormControl>
            <FormControl.Label>Therapy Category</FormControl.Label>
            <Pressable onPress={onTherapyOpen}>
              <Box
                borderWidth={1}
                borderColor="gray.300"
                borderRadius={4}
                px={3}
                py={3}
                bg="gray.50">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color={item.therapyTag ? 'black' : 'gray.400'}>
                    {getTherapyLabel(item.therapyTag)}
                  </Text>
                  <Icon
                    as={<FontAwesomeIcon icon={faChevronDown} />}
                    size="sm"
                    color="gray.400"
                  />
                </HStack>
              </Box>
            </Pressable>
          </FormControl>
          {item.isManual && (
            <FormControl>
              <FormControl.Label>Medicine Strip Photo</FormControl.Label>
              <Button
                variant="outline"
                leftIcon={
                  isCameraLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <Icon as={<FontAwesomeIcon icon={faCamera} />} />
                  )
                }
                onPress={handleCameraLaunch}
                isDisabled={isCameraLoading}>
                {item.photo ? 'Photo Uploaded' : 'Capture Strip Photo'}
              </Button>
              {item.photo && (
                <HStack alignItems="center" mt={2} space={2}>
                  <Image
                    source={{uri: item.photo.uri}}
                    style={{width: 32, height: 32, borderRadius: 4}}
                    resizeMode="cover"
                  />
                  <Text>{item.photo.fileName}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      onUpdateMedication({
                        id: item.id,
                        field: 'photo',
                        value: null,
                      })
                    }>
                    <FontAwesomeIcon icon={faTimesCircle} color="red" />
                  </TouchableOpacity>
                </HStack>
              )}
            </FormControl>
          )}
        </VStack>

        {/* Frequency Action Sheet */}
        <Actionsheet isOpen={isFrequencyOpen} onClose={onFrequencyClose}>
          <Actionsheet.Content>
            <Box w="100%" h={60} px={4} justifyContent="center">
              <Text fontSize="16" color="gray.500" _dark={{color: 'gray.300'}}>
                Select Dosage Frequency
              </Text>
            </Box>
            {FREQUENCY_OPTIONS.map(option => (
              <Actionsheet.Item
                key={option.value}
                onPress={() => handleFrequencySelect(option.value)}>
                <Text>{option.label}</Text>
              </Actionsheet.Item>
            ))}
          </Actionsheet.Content>
        </Actionsheet>

        {/* Therapy Category Action Sheet */}
        <Actionsheet isOpen={isTherapyOpen} onClose={onTherapyClose}>
          <Actionsheet.Content>
            <Box w="100%" h={60} px={4} justifyContent="center">
              <Text fontSize="16" color="gray.500" _dark={{color: 'gray.300'}}>
                Select Therapy Category
              </Text>
            </Box>
            {THERAPY_CATEGORIES.map(category => (
              <Actionsheet.Item
                key={category}
                onPress={() => handleTherapySelect(category)}>
                <Text>{category}</Text>
              </Actionsheet.Item>
            ))}
          </Actionsheet.Content>
        </Actionsheet>
      </Box>
    );
  },
);

export default MedicationItem;
