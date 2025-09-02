import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/Home';
import GeminiChat from './screens/Gemini';
import OnboardingScreen from './screens/onboarding';
import SettingsScreen from './screens/Settings';
import RecipeGenerator from './screens/RecipeGenerator';
import IngredientsList from 'screens/ingredientsList';
import SaveRecipe from 'screens/saveRecipe';
import Profile from 'screens/profile';


import { StatusBar } from 'expo-status-bar';
import { auth } from './utils/authPersistence';
import { checkOnboardingStatus } from './utils/storage';

import './global.css';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { userEmail: string };
  Gemini: undefined;
  Onboarding: undefined;
  Settings: undefined;
  RecipeGenerator: undefined;
  IngredientsList: undefined;
  SaveRecipe: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Onboarding' | 'Home'>('Login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await checkOnboardingStatus(currentUser.uid);
        setInitialRoute(hasCompletedOnboarding ? 'Home' : 'Onboarding');
      } else {
        setInitialRoute('Login');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Or a loading component
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          initialParams={{ userEmail: user?.email || '' }}
        />
        <Stack.Screen name="Gemini" component={GeminiChat} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="RecipeGenerator" component={RecipeGenerator} />
        <Stack.Screen name="IngredientsList" component={IngredientsList} />
        <Stack.Screen name="SaveRecipe" component={SaveRecipe} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
