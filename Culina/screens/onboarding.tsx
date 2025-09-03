import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import Background from '../components/background';
import { markOnboardingComplete } from '../utils/storage';
import { auth } from '../utils/authPersistence';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Your Kitchen, Smarter Than Ever',
    description:
      'Let Culina help you plan meals using what you already have. Scan, suggest, and cook with confidence.',
    renderImage: () => (
      <Image source={require('../assets/culinalogo.png')} style={styles.image} />
    ),
  },
  {
    title: 'Personalized Recipes with AI',
    description:
      'Discover recipes tailored to your taste, dietary needs, and available ingredients—all powered by smart AI.',
    renderImage: () => (
      <Image source={require('../assets/PRwAI.png')} style={styles.image} />
    ),
  },
  {
    title: 'Scan Ingredients. Get Inspired.',
    description:
      'Use your camera to scan pantry items and let Culina suggest meals, reduce food waste, and save time daily.',
    renderImage: () => (
      <Image source={require('../assets/SIGI.png')} style={styles.image} />
    ),
  },
];

const Onboarding = ({ navigation }: Props) => {
  const handleGetStarted = async () => {
    const user = auth.currentUser;
    if (user) {
      await markOnboardingComplete(user.uid);
    }
    navigation.navigate('Home');
  };

  return (
    <Background>
      <Swiper
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            {slide.renderImage()}
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
            {index === slides.length - 1 && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleGetStarted}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>
    </Background>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4aa8ff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4aa8ff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default Onboarding;