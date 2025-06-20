export default mockData = {
  user: {
    id: 'user_12345',
    profilePic: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    mobileNumber: '9876543210',
    subscription: {
      plan: 'Premium',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      status: 'Active',
      expiry: '2023-12-31',
      isActive: true,
      benefits: ['Benefit 1', 'Benefit 2'],
    },
    gender: 'male',
    dateOfBirth: '1985-03-15T00:00:00.000Z',
    age: '39',
    registrationDate: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-12-15T14:22:00Z',
    flatNumber: '301',
    blockNumber: 'A',
    buildingNumber: 'Sunrise Apartments',
    address:
      '301, Block A, Sunrise Apartments, Koramangala 4th Block, Bangalore, Karnataka 560034',
    location: {
      latitude: 12.9352,
      longitude: 77.6245,
    },
    familyMembers: {
      male: '2',
      female: '2',
      children: '1',
    },
    healthIssues: {
      bloodPressure: true,
      diabetes: true,
      kidneyProblems: false,
      neurologicalProblems: false,
      cancer: false,
      other: 'Occasional migraine headaches and joint pain in knees',
    },
    currentMedications: [
      {
        id: 'med_001',
        name: 'Metformin 500mg',
        dosage: '1 tablet',
        frequency: '2',
        stripColor: '#FF6B6B',
        therapyTag: 'Antidiabetic',
        isManual: false,
        mrp: '45',
        skuId: 'SKU001234',
        imageUrl:
          'https://5.imimg.com/data5/SELLER/Default/2023/8/338079454/YJ/BK/BU/194269521/500mg-metformin-hydrochloride-sustained-release-tablets.jpg',
      },
      {
        id: 'med_002',
        name: 'Amlodipine 5mg',
        dosage: '1 tablet',
        frequency: '1',
        stripColor: '#4ECDC4',
        therapyTag: 'Antihypertensive',
        isManual: false,
        mrp: '85',
        skuId: 'SKU005678',
        imageUrl:
          'https://ecommerce.genericartmedicine.com/upload/products/product-photo-1602402024104042.jpg',
      },
      {
        id: 'med_003',
        name: 'Calcium Carbonate',
        dosage: '2 tablets',
        frequency: '1',
        stripColor: '#95E1D3',
        therapyTag: 'Vitamin',
        isManual: true,
        mrp: '120',
      },
    ],
    healthParameters: {
      height: '175',
      weight: '78',
      bloodPressure: '135/88',
      bloodSugar: '145',
      spo2: '97',
      bpPhoto: null,
      glucometerPhoto: null,
      pulseOximeterPhoto: null,
    },
    emergencyContacts: [
      {
        name: 'Priya Kumar',
        relationship: 'Spouse',
        phone: '+91 9876543211',
      },
      // {
      //   name: 'Dr. Ramesh Sharma',
      //   relationship: 'Family Doctor',
      //   phone: '+91 9876543212',
      // },
    ],
    prescription: [],
    healthRecords: [],
    preferences: {
      language: 'english',
      notifications: {
        medicationReminders: true,
        healthTips: true,
        appointmentReminders: true,
      },
      units: {
        weight: 'kg',
        height: 'cm',
        temperature: 'celsius',
      },
    },
    calculatedValues: {
      bmi: 25.5,
      totalFamilyMembers: 5,
      activeMedicationsCount: 3,
      profileCompleteness: 92,
      lastHealthUpdateDaysAgo: 1,
    },
  },
};
