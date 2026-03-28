# Shram Swasthya Portal - React Native Frontend

A mobile application for the Shram Swasthya Portal built with React Native and Expo.

## Features

- Multi-role authentication (Super Admin, Admin, Vendor, Field Staff, Doctor, Patient)
- Role-based navigation and dashboards
- QR code scanning for patient identification
- Dynamic tier-based health assessment forms
- Patient profile and report management
- Doctor diagnosis and prescription interface

## Tech Stack

- React Native
- Expo
- React Navigation
- React Native Paper (UI components)
- Axios (API calls)
- AsyncStorage (local storage)
- Expo Barcode Scanner

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React contexts (Auth)
│   ├── navigation/         # Navigation setup
│   ├── screens/            # Screen components
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── App.tsx                 # Main app component
└── package.json
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/emulator:**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - For web: `npm run web`

## Backend Integration

The app is configured to connect to the backend API at `http://localhost:5000/api`. Update the `API_BASE_URL` in `src/services/api.ts` if your backend is running on a different URL.

## Key Screens

- **LoginScreen**: Authentication for all user roles
- **FieldStaffDashboard**: QR scanning and patient form entry
- **DoctorDashboard**: Patient diagnosis and prescription
- **PatientDashboard**: Profile and report viewing
- **Admin/Vendor Dashboards**: Management interfaces

## API Endpoints Used

- `POST /api/auth/login` - User login
- `GET /api/patients/qr/:qrCode` - Get patient by QR
- `GET /api/eligibility/:patientId` - Check eligibility
- `POST /api/patients/:id/questionnaire` - Submit health assessment

## Notes

- Ensure the backend is running and accessible
- Camera permissions are required for QR scanning
- The app uses JWT tokens for authentication
- Form validation is implemented for required fields

## Development

- Use `expo install` to add new Expo-compatible packages
- Test on both iOS and Android devices/emulators
- Follow React Native and Expo best practices