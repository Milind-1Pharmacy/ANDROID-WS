import React, {useState, useCallback} from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
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
  Heading,
  Icon,
  Spinner,
  View,
  Divider,
} from 'native-base';
import DocumentPicker from 'react-native-document-picker';
import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
} from 'react-native-image-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCamera,
  faUpload,
  faExclamationTriangle,
  faTimesCircle,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
  faFileImage,
  faFile,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

interface HealthParamFormProps {
  initialData: {
    healthParameters: {
      height?: string;
      weight?: string;
      bloodPressure?: string;
      bloodSugar?: string;
      spo2?: string;
      bpPhoto?: any;
      glucometerPhoto?: any;
      pulseOximeterPhoto?: any;
    };
    healthRecords: any[];
    prescription: any[];
  };
  handleSubmit: (data: any) => void;
}

const HealthParamForm: React.FC<HealthParamFormProps> = ({
  initialData,
  handleSubmit,
}) => {
  // State management
  const [healthParameters, setHealthParameters] = useState(
    initialData.healthParameters,
  );
  const [healthRecords, setHealthRecords] = useState({
    files: initialData.healthRecords,
  });
  const [isUploading, setIsUploading] = useState(false);

  // Camera configuration
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

  // File icon helper
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

  // Camera handler
  const launchCameraForPhoto = useCallback(
    async (type: 'bpMonitor' | 'glucometer' | 'pulseOximeter') => {
      try {
        // Check camera permission
        if (Platform.OS === 'android') {
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
        }

        // Launch camera
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
        setHealthParameters(prev => ({
          ...prev,
          ...(type === 'bpMonitor' && {
            bpPhoto: {
              name: photo.fileName,
              fileCopyUri: photo.uri,
              size: photo.fileSize,
              type: photo.type,
              uri: photo.uri,
            },
          }),
          ...(type === 'glucometer' && {
            glucometerPhoto: {
              name: photo.fileName,
              fileCopyUri: photo.uri,
              size: photo.fileSize,
              type: photo.type,
              uri: photo.uri,
            },
          }),
          ...(type === 'pulseOximeter' && {
            pulseOximeterPhoto: {
              name: photo.fileName,
              fileCopyUri: photo.uri,
              size: photo.fileSize,
              type: photo.type,
              uri: photo.uri,
            },
          }),
        }));

        Alert.alert('Success', 'Photo captured successfully');
      } catch (err) {
        console.error('Camera error:', err);
        Alert.alert('Error', 'Failed to access camera');
      }
    },
    [],
  );

  // Document picker handler
  const handleFileUpload = useCallback(async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
        ],
        allowMultiSelection: true,
      });

      const filesWithUri = result
        .map(file => ({
          ...file,
          uri: file.uri || file.fileCopyUri || '',
        }))
        .filter(file => file.uri);

      setHealthRecords(prev => ({
        files: [...prev.files, ...filesWithUri],
      }));

      Alert.alert(
        'Success',
        `${filesWithUri.length} file(s) uploaded successfully`,
      );
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('File upload error:', err);
        Alert.alert('Error', 'Failed to upload files');
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Remove file handler
  const handleRemoveFile = useCallback((index: number) => {
    setHealthRecords(prev => ({
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  // Remove photo handler
  const handleRemovePhoto = useCallback(
    (type: 'bpPhoto' | 'glucometerPhoto' | 'pulseOximeterPhoto') => {
      setHealthParameters(prev => ({
        ...prev,
        [type]: null,
      }));
    },
    [],
  );

  // Submit handler
  const onSubmit = useCallback(() => {
    const data = {
      healthParameters,
      healthRecords: healthRecords.files,
      prescription: [], // You can add prescription handling if needed
    };
    handleSubmit(data);
  }, [healthParameters, healthRecords, handleSubmit]);

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#f8f9fa'}}>
      <Box p={4}>
        {/* Health Parameters Section */}
        <Box mb={6}>
          <Heading fontSize="lg" mb={4} color="gray.700">
            Health Parameters
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
                  <Text>{healthParameters.bpPhoto.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto('bpPhoto')}>
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
                onPress={() => launchCameraForPhoto('glucometer')}>
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
                    onPress={() => handleRemovePhoto('glucometerPhoto')}>
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
                onPress={() => launchCameraForPhoto('pulseOximeter')}>
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
                    onPress={() => handleRemovePhoto('pulseOximeterPhoto')}>
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
            Health Records
          </Heading>

          <Button
            onPress={handleFileUpload}
            variant="solid"
            bg="#2e6acf"
            _text={{color: '#fff'}}
            _pressed={{bg: '#1f4cab'}}
            shadow={2}
            mb={4}
            isLoading={isUploading}
            leftIcon={<Icon as={<FontAwesomeIcon icon={faUpload} />} />}>
            Upload Reports (Image or PDF)
          </Button>

          {healthRecords.files.length > 0 && (
            <Box>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 2,
                }}>
                Uploaded Files ({healthRecords.files.length})
              </Text>
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
                        <Text
                          style={{
                            fontSize: 12,
                            // marginBottom: 2,
                          }}>
                          {((file?.size ?? 0) / 1024).toFixed(1)} KB •{' '}
                          {file?.type}
                        </Text>
                      </VStack>
                    </HStack>
                    <TouchableOpacity
                      onPress={() => handleRemoveFile(index)}
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
          onPress={onSubmit}
          colorScheme="teal"
          size="lg"
          leftIcon={<Icon as={<FontAwesomeIcon icon={faCheck} />} />}>
          Save Medical Reports
        </Button>
      </Box>
    </ScrollView>
  );
};

export default HealthParamForm;
