# Nourify

An intuitive app designed to make meal logging effortless, providing a seamless and user-friendly experience.

## Introduction

In today’s busy world, keeping track of what we eat and staying on top of our nutrition can be quite a challenge. Many people use mobile apps to help with this, but I’ve found that a lot of these apps are just too complicated and time-consuming. This frustration, combined with my interest in nutrition and fitness, inspired me to create Nourify, a mobile app that makes food logging quick and easy.

In the app, you can log your meals using three different methods: image recognition, barcode scanning, and a search bar. Additionally, you can visualize your progress, making it easier to stay on track with your nutrition goals.

## Table of Contents

1. [Installation Instructions](#installation-instructions)
2. [Usage Instructions](#usage-instructions)
3. [Authors and Acknowledgments](#authors-and-acknowledgments)
4. [License](#license)
5. [Contact Information](#contact-information)

## Installation Instructions

### Prerequisites

- Emulator or Expo Go app downloaded on a mobile device
- Node.js version 18 or higher
- Firebase project (free): [Firebase Console](https://console.firebase.google.com/)
- CalorieNinjas API key (free): [CalorieNinjas](https://calorieninjas.com/)
- Clarifai API key (free): [Clarifai](https://www.clarifai.com/)

### Step-by-Step Guide

1. Clone this repository
2. Navigate to the project directory: `cd Nourify-Finalwork`
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory
5. Copy and paste the environment variables from below and replace the API keys:

```plaintext
EXPO_PUBLIC_FIREBASE_API_KEY=[to fill]
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=[to fill]
EXPO_PUBLIC_FIREBASE_PROJECT_ID=[to fill]
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=[to fill]
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[to fill]
EXPO_PUBLIC_FIREBASE_APP_ID=[to fill]
EXPO_PUBLIC_CALORIENINJAS_API_KEY=[to fill]
EXPO_PUBLIC_CLARIFAI_API_KEY=[to fill]
```

### Dependencies

- React Native
- Expo
- Axios
- Dotenv
- Firebase
- Moment
- React Native Skia

## Usage Instructions

### Launching the App

To start the app, run: `npx expo start`

## Authors and Acknowledgments

### Author

Izzet Sen: Developer and project lead.

### Acknowledgments

Thanks to Cansu Bilal for user testing the Nourify app.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact Information

For questions or support, contact Izzet Sen at [izzet.sen@student.ehb.be](mailto:izzet.sen@student.ehb.be).
