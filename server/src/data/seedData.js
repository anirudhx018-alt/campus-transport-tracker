// Initial seed data with realistic Stanford-style university campus coordinates
const stopsData = [
  {
    _id: '670000000000000000000001',
    name: 'Campus Main Gate & Transit Hub',
    code: 'ST-PLAZA',
    lat: 37.4295,
    lng: -122.1700,
    hasShelter: true,
    landmark: 'Palm Drive Welcome Booth',
    description: 'Central transit exchange with bike racks and digital schedule kiosk.'
  },
  {
    _id: '670000000000000000000002',
    name: 'Science & Engineering Quad (SEQ)',
    code: 'ST-ENG',
    lat: 37.4280,
    lng: -122.1745,
    hasShelter: true,
    landmark: 'Huang Engineering Center',
    description: 'High-density stop serving CS, Robotics, and Mechanical labs.'
  },
  {
    _id: '670000000000000000000003',
    name: 'Green Library & Tech Commons',
    code: 'ST-LIB',
    lat: 37.4262,
    lng: -122.1690,
    hasShelter: true,
    landmark: 'Main Quad Clock Tower',
    description: 'Popular stop for humanities students, quiet study zones, and cafes.'
  },
  {
    _id: '670000000000000000000004',
    name: 'Medical Center & Hospital Plaza',
    code: 'ST-MED',
    lat: 37.4345,
    lng: -122.1765,
    hasShelter: true,
    landmark: 'School of Medicine Building',
    description: 'Serves medical staff, clinical students, and outpatient pavilions.'
  },
  {
    _id: '670000000000000000000005',
    name: "Governor's Corner Residential Village",
    code: 'ST-RES-N',
    lat: 37.4245,
    lng: -122.1795,
    hasShelter: true,
    landmark: 'Lakeside Dining Center',
    description: 'Undergraduate dormitories, student dining, and student recreation courts.'
  },
  {
    _id: '670000000000000000000006',
    name: 'Athletic Pavilion & Stadium',
    code: 'ST-ATH',
    lat: 37.4325,
    lng: -122.1615,
    hasShelter: false,
    landmark: 'Aquatics Center & Varsity Gym',
    description: 'Main athletics complex with fitness facilities and field tracks.'
  },
  {
    _id: '670000000000000000000007',
    name: 'The Oval & Memorial Auditorium',
    code: 'ST-OVAL',
    lat: 37.4305,
    lng: -122.1695,
    hasShelter: true,
    landmark: 'Memorial Church Gateway',
    description: 'Campus administrative offices, visitor center, and arts auditorium.'
  },
  {
    _id: '670000000000000000000008',
    name: 'Escondido Village & Graduate Housing',
    code: 'ST-RES-E',
    lat: 37.4235,
    lng: -122.1595,
    hasShelter: true,
    landmark: 'EVGR Community Pavilion',
    description: 'Residential apartments, family housing, and community park.'
  }
];

const routesData = [
  {
    _id: '671000000000000000000001',
    name: 'Blue Line - Academic Core',
    code: 'RT-ACAD',
    color: '#2563EB',
    description: 'High-frequency circular route connecting Main Transit Hub, Engineering, Libraries, and the Oval.',
    stops: [
      { stopId: '670000000000000000000001', order: 1, stopDurationMin: 2 },
      { stopId: '670000000000000000000002', order: 2, stopDurationMin: 2 },
      { stopId: '670000000000000000000003', order: 3, stopDurationMin: 2 },
      { stopId: '670000000000000000000007', order: 4, stopDurationMin: 2 }
    ],
    pathCoordinates: [
      [37.4295, -122.1700],
      [37.4290, -122.1720],
      [37.4285, -122.1735],
      [37.4280, -122.1745],
      [37.4270, -122.1740],
      [37.4265, -122.1715],
      [37.4262, -122.1690],
      [37.4275, -122.1685],
      [37.4295, -122.1690],
      [37.4305, -122.1695],
      [37.4300, -122.1700],
      [37.4295, -122.1700]
    ],
    schedule: {
      startTime: '07:00 AM',
      endTime: '11:00 PM',
      frequencyMinutes: 10
    },
    status: 'ACTIVE'
  },
  {
    _id: '671000000000000000000002',
    name: 'Emerald Line - West Campus & Medical',
    code: 'RT-WEST',
    color: '#059669',
    description: 'Connects the Central Transit Hub with Medical Center, Health Sciences, and North Student Residences.',
    stops: [
      { stopId: '670000000000000000000001', order: 1, stopDurationMin: 2 },
      { stopId: '670000000000000000000004', order: 2, stopDurationMin: 3 },
      { stopId: '670000000000000000000005', order: 3, stopDurationMin: 2 },
      { stopId: '670000000000000000000002', order: 4, stopDurationMin: 2 }
    ],
    pathCoordinates: [
      [37.4295, -122.1700],
      [37.4315, -122.1720],
      [37.4335, -122.1745],
      [37.4345, -122.1765],
      [37.4320, -122.1780],
      [37.4285, -122.1790],
      [37.4245, -122.1795],
      [37.4255, -122.1770],
      [37.4280, -122.1745],
      [37.4290, -122.1720],
      [37.4295, -122.1700]
    ],
    schedule: {
      startTime: '06:30 AM',
      endTime: '10:30 PM',
      frequencyMinutes: 15
    },
    status: 'ACTIVE'
  },
  {
    _id: '671000000000000000000003',
    name: 'Crimson Line - Athletics & East Village',
    code: 'RT-EAST',
    color: '#DC2626',
    description: 'Serves Athletics fields, stadium recreation, and graduate residential village to campus center.',
    stops: [
      { stopId: '670000000000000000000001', order: 1, stopDurationMin: 2 },
      { stopId: '670000000000000000000007', order: 2, stopDurationMin: 2 },
      { stopId: '670000000000000000000006', order: 3, stopDurationMin: 2 },
      { stopId: '670000000000000000000008', order: 4, stopDurationMin: 3 }
    ],
    pathCoordinates: [
      [37.4295, -122.1700],
      [37.4305, -122.1695],
      [37.4318, -122.1660],
      [37.4325, -122.1615],
      [37.4300, -122.1600],
      [37.4265, -122.1590],
      [37.4235, -122.1595],
      [37.4245, -122.1635],
      [37.4262, -122.1670],
      [37.4285, -122.1685],
      [37.4295, -122.1700]
    ],
    schedule: {
      startTime: '07:30 AM',
      endTime: '11:45 PM',
      frequencyMinutes: 12
    },
    status: 'ACTIVE'
  }
];

const busesData = [
  {
    _id: '672000000000000000000001',
    busNumber: 'SH-101',
    plateNumber: 'CP-8841',
    capacity: 45,
    currentOccupancy: 28,
    driverName: 'Marcus Vance',
    driverPhone: '+1 (555) 234-5678',
    status: 'IN_TRANSIT',
    routeId: '671000000000000000000001',
    currentLocation: {
      lat: 37.4290,
      lng: -122.1720,
      heading: 240,
      speed: 28
    },
    currentWaypointIndex: 1,
    nextStopId: '670000000000000000000002',
    etaMinutes: 2
  },
  {
    _id: '672000000000000000000002',
    busNumber: 'SH-102',
    plateNumber: 'CP-8842',
    capacity: 40,
    currentOccupancy: 14,
    driverName: 'Elena Rostova',
    driverPhone: '+1 (555) 345-6789',
    status: 'IN_TRANSIT',
    routeId: '671000000000000000000001',
    currentLocation: {
      lat: 37.4265,
      lng: -122.1715,
      heading: 110,
      speed: 32
    },
    currentWaypointIndex: 5,
    nextStopId: '670000000000000000000003',
    etaMinutes: 3
  },
  {
    _id: '672000000000000000000003',
    busNumber: 'SH-201',
    plateNumber: 'CP-9103',
    capacity: 50,
    currentOccupancy: 38,
    driverName: 'Devon Washington',
    driverPhone: '+1 (555) 456-7890',
    status: 'IN_TRANSIT',
    routeId: '671000000000000000000002',
    currentLocation: {
      lat: 37.4335,
      lng: -122.1745,
      heading: 315,
      speed: 30
    },
    currentWaypointIndex: 2,
    nextStopId: '670000000000000000000004',
    etaMinutes: 1
  },
  {
    _id: '672000000000000000000004',
    busNumber: 'SH-202',
    plateNumber: 'CP-9104',
    capacity: 35,
    currentOccupancy: 12,
    driverName: 'Samantha Chen',
    driverPhone: '+1 (555) 567-8901',
    status: 'IN_TRANSIT',
    routeId: '671000000000000000000002',
    currentLocation: {
      lat: 37.4255,
      lng: -122.1770,
      heading: 50,
      speed: 25
    },
    currentWaypointIndex: 7,
    nextStopId: '670000000000000000000002',
    etaMinutes: 4
  },
  {
    _id: '672000000000000000000005',
    busNumber: 'SH-301',
    plateNumber: 'CP-7419',
    capacity: 45,
    currentOccupancy: 22,
    driverName: 'Carlos Gomez',
    driverPhone: '+1 (555) 678-9012',
    status: 'IN_TRANSIT',
    routeId: '671000000000000000000003',
    currentLocation: {
      lat: 37.4318,
      lng: -122.1660,
      heading: 85,
      speed: 29
    },
    currentWaypointIndex: 2,
    nextStopId: '670000000000000000000006',
    etaMinutes: 2
  },
  {
    _id: '672000000000000000000006',
    busNumber: 'SH-302',
    plateNumber: 'CP-7420',
    capacity: 40,
    currentOccupancy: 0,
    driverName: 'Aisha Patel',
    driverPhone: '+1 (555) 789-0123',
    status: 'MAINTENANCE',
    routeId: '671000000000000000000003',
    currentLocation: {
      lat: 37.4295,
      lng: -122.1700,
      heading: 0,
      speed: 0
    },
    currentWaypointIndex: 0,
    nextStopId: null,
    etaMinutes: 0
  }
];

const alertsData = [
  {
    _id: '673000000000000000000001',
    title: 'Career Fair Shuttle Frequency Boost',
    message: 'Blue Line running every 7 minutes today to accommodate Career Fair traffic at the Oval.',
    type: 'INFO',
    routeId: '671000000000000000000001',
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    _id: '673000000000000000000002',
    title: 'Routine Inspection: Bus SH-302',
    message: 'SH-302 is undergoing scheduled brake inspection. SH-301 running normal Crimson Line schedule.',
    type: 'WARNING',
    routeId: '671000000000000000000003',
    createdAt: new Date(Date.now() - 7200000)
  }
];

module.exports = {
  stopsData,
  routesData,
  busesData,
  alertsData
};
