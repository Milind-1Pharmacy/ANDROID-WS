import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
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
} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTimes,
  faCamera,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import {TABLET_CAPSULE_IMAGE_FALLBACK} from '@Constants';

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
    console.log('Rendering medication:', item);

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
                leftIcon={<Icon as={<FontAwesomeIcon icon={faCamera} />} />}
                onPress={() => onPhotoUpload('medicineStrip', item?.id)}>
                {item.photo ? 'Photo Uploaded' : 'Upload Strip Photo'}
              </Button>
              {item.photo && <Text>📷 Photo uploaded successfully</Text>}
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
