🩺 Health Companion
Health Companion is a smart web-based health assistant that helps users monitor their health and receive personalized diet and exercise recommendations based on their personal and physiological data.
The platform collects user health information and analyzes it to suggest a 7-day health improvement plan including diet and workout routines. It also evaluates the user's heartbeat rate and provides recommendations to maintain a healthy level.

>> Features
>> Secure Authentication

User authentication is implemented using JWT (JSON Web Tokens).

Users can securely log in using their mobile number.

Tokens are generated and validated for secure session management.


>> User Health Profile

The system collects important biographical and health information, including:

Name

Age

Height

Weight

Daily lifestyle activity (walking, sedentary, active etc.)

Food preference (Vegetarian / Non-Vegetarian)

Allergies (users can specify any food or substance they are allergic to)

This information helps the system generate personalized recommendations.


>>Heartbeat Analysis

Users can input their heartbeat rate, and the system:

Determines whether the heartbeat is normal or abnormal

Provides suggestions to improve cardiovascular health

Recommends appropriate exercise routines and dietary adjustments


>> Personalized Diet Plan

Based on user data such as:

Height

Weight

Age

Lifestyle

Food preferences

Allergies

The platform generates a custom 7-day diet plan tailored to the user.


>> Exercise Recommendations

The system also generates a 7-day workout routine designed to:

Improve overall health

Regulate heartbeat levels

Maintain or improve fitness

>> AI-Powered Plan Generation

The diet and exercise plans are generated using the OpenRouter API, which helps produce intelligent and personalized health suggestions.
