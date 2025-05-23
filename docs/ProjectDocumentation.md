# AquaManager Project Documentation

## Project Overview

The AquaManager is a NextJS web application developed within Firebase Studio. The primary goal of the application is to provide aquarium enthusiasts with a convenient and accurate method for analyzing their aquarium water parameters using test strips. Users can upload images of their test strips, and the application will utilize AI to interpret the results and provide actionable insights.

## Features

The AquaManager includes the following key features:

*   **Image Upload:** Allows users to upload images of their aquarium test strips directly from their devices.
*   **Image Preprocessing:** Processes uploaded images to identify and isolate the colorimetric pads on the test strip, preparing them for AI analysis.
*   **AI Parameter Analysis:** Employs an AI-powered tool to accurately determine water parameters based on the color values extracted from the test strip image. This involves correlating color values to known scales and providing estimated readings.
*   **Parameter Display:** Presents clear and immediate feedback on detected water parameters, highlighting any values that fall outside the ideal range for a healthy aquarium.
*   **Historical Data Tracking:** Enables users to store and review historical water parameter data, allowing them to monitor trends and the stability of their aquarium's water quality over time.
*   **Water Change Tracking & Notifications:** Tracks water changes for each aquarium managed within the app and sends email notifications to remind users when it's time for their next water change.
*   **Social Sharing:** Provides functionality for users to easily share individual test results or their full test history with others.
*   **Recommended Treatment Products:** Recommends relevant treatment products to users based on their water parameter analysis results, utilizing Amazon's API for product suggestions.
*   **Community Support Forum:** A dedicated forum section where registered users can ask questions and receive answers from other members of the AquaStrip Analyzer community. Includes account registration and reporting functions for abusive content.
*   **Classified Marketplace:** A marketplace feature allowing users to list and find aquarium-related items such as fish, plants, and equipment for sale or trade within the AquaManager community.

## Technical Requirements

The AquaStrip Analyzer project is built upon the following technical stack and dependencies:

*   **Framework:** NextJS
*   **Backend/Cloud Platform:** Firebase (likely utilized for user authentication, database (Firestore or Realtime Database), storage, and potentially Cloud Functions for backend logic like email notifications and AI processing).
*   **Database:** Implied by "Historical Data Tracking" and "Community Support Forum" (likely Firestore or Realtime Database).
*   **Storage:** Implied by "Image Upload" (Firebase Storage).
*   **Authentication:** Implied by "Community Support Forum" and "Account Registration" (Firebase Authentication).
*   **AI/ML Libraries:** Required for "AI Parameter Analysis" (Specific libraries for image processing and color analysis will be needed, e.g., TensorFlow.js, OpenCV.js, or backend equivalents if processing is done server-side).
*   **External APIs:**
    *   Amazon API: Used for "Recommended Treatment Products" to fetch product suggestions.
*   **Styling/Component Library:** Shadcn UI
*   **Icon Library:** Lucide (integrated with Shadcn UI)

## Design Guidelines

The AquaManager's design adheres to the following guidelines to ensure a visually appealing and user-friendly experience:

*   **Primary Color:** Deep turquoise (#45B6FE), used to evoke a sense of clarity and depth associated with aquarium water.
*   **Background Color:** Light cyan (#E0F7FA), providing a clean, airy, and spacious feel throughout the application.
*   **Accent Color:** Muted teal (#4DB6AC), utilized for interactive elements such as buttons and calls to action to provide visual cues.
*   **Typography:** Clean and modern sans-serif fonts are used for optimal readability. The application utilizes Shadcn UI's default typography settings for consistency across all components.
*   **Icons:** Simple and clear icons, sourced from the Lucide library, are used to represent different water parameters, features, and functions within the app, ensuring easy visual identification.
*   **Layout:** The application features an intuitive and well-organized layout to facilitate easy navigation and understanding of data. Shadcn UI's grid and spacing utilities are leveraged to ensure a responsive design that adapts well to various screen sizes.