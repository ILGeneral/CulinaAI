import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${userId}`);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const markOnboardingComplete = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
  }
};

export const clearOnboardingStatus = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
  } catch (error) {
    console.error('Error clearing onboarding status:', error);
  }
};
