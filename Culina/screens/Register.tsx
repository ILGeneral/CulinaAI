import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import AgreeTermsCheckBox from '../components/agreeTermsCheckBox';
import CustomCheckBox from '../components/customCheckBox';
import Background from '../components/background';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const dietaryOptions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Low-Carb',
];

const allergyOptions = [
  'None',
  'Peanuts',
  'Tree nuts',
  'Dairy',
  'Gluten',
  'Soy',
  'Shellfish',
];

const religiousOptions = [
  'None',
  'Halal',
  'Kosher',
  'Buddhist',
  'Hindu',
  'Other',
];

const calorieOptions = [
  'None',
  'Maintain weight',
  'Lose weight',
  'Gain weight',
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const Register = () => {
  const navigation = useNavigation<NavigationProp>();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Auth Info
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Preferences
  const [dietaryLifestyle, setDietaryLifestyle] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [religiousPractice, setReligiousPractice] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!email || !username || !password || !confirmPassword) {
        Alert.alert('Validation Error', 'Please fill in all fields.');
        return;
      }
      
      if (password.length < 6) {
        Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match.');
        return;
      }
      
      // Move to step 2
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleCreateAccount = async () => {
    if (!agreeTerms) {
      Alert.alert('Terms Required', 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    console.log('🚀 Starting account creation process...');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🍎 Dietary Lifestyle:', dietaryLifestyle || 'Not specified');
    console.log('🚫 Allergies:', allergies.length > 0 ? allergies : ['None specified']);
    console.log('🕌 Religious Practice:', religiousPractice || 'Not specified');
    console.log('🎯 Calorie Goal:', calorieGoal || 'Not specified');

    try {
      // Step 1: Create Firebase Auth user
      console.log('🔐 Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase Auth user created successfully!');
      console.log('🆔 User UID:', user.uid);
      console.log('📧 User Email:', user.email);

      // Step 2: Prepare user data for Firestore
      const userData = {
        email: user.email,
        username: username,
        dietaryLifestyle: dietaryLifestyle || 'None',
        allergies: allergies.length > 0 ? allergies : ['None'],
        religiousPractice: religiousPractice || 'None',
        calorieGoal: calorieGoal || 'None',
        createdAt: new Date().toISOString(),
        uid: user.uid,
      };

      console.log('📋 User data to be saved:', userData);

      // Step 3: Create Firestore document
      console.log('💾 Saving user data to Firestore...');
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, userData);
      
      console.log('✅ User data saved to Firestore successfully!');
      console.log('📄 Document path: users/' + user.uid);

      // Step 4: Success feedback
      Alert.alert(
        'Account Created!', 
        `Welcome ${username}! Your account has been created successfully.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              console.log('🎉 Navigating to Onboarding...');
              navigation.navigate('Onboarding');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Account creation failed:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // More specific error handling
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('firestore') || error.message.includes('Firestore')) {
        errorMessage = 'Account was created but there was an issue saving your preferences. Please contact support.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>
        Create your personal account now to access all the exclusive benefits we offer.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password (min 6 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
    </View>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Tell Us Your Preferences</Text>
        <Text style={styles.subtitle}>
          Help us personalize your experience by choosing your dietary and lifestyle preferences, including allergies, cultural needs, calorie goals, and any extra instructions.
        </Text>

        <Text style={styles.label}>Dietary Lifestyle</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={dietaryLifestyle}
            onValueChange={setDietaryLifestyle}
            mode="dropdown"
          >
            <Picker.Item label="Select your dietary lifestyle" value="" />
            {dietaryOptions.map(opt => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Allergies</Text>
        <View style={styles.allergiesContainer}>
          {allergyOptions.map((option) => (
            <View key={option} style={styles.checkboxRow}>
              <CustomCheckBox
                checked={allergies.includes(option)}
                onToggle={() => {
                  if (allergies.includes(option)) {
                    setAllergies(allergies.filter((item) => item !== option));
                  } else {
                    setAllergies([...allergies, option]);
                  }
                }}
              />
              <Text style={styles.checkboxLabel}>{option}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Religious/Cultural Dietary Practices</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={religiousPractice}
            onValueChange={setReligiousPractice}
            mode="dropdown"
          >
            <Picker.Item label="Select religious or cultural dietary practices" value="" />
            {religiousOptions.map(opt => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Calories-Based Diets</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={calorieGoal}
            onValueChange={setCalorieGoal}
            mode="dropdown"
          >
            <Picker.Item label="Select your calorie goal" value="" />
            {calorieOptions.map(opt => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <View style={styles.checkboxContainer}>
          <AgreeTermsCheckBox
            checked={agreeTerms}
            onToggle={() => setAgreeTerms(!agreeTerms)}
          />
          <Text style={styles.checkboxText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('#')}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('#')}>
              Privacy Policy
            </Text>.
          </Text>
        </View>

        <Text style={styles.infoText}>
          You can update these anytime in your profile settings.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.flex}
        >
          {currentStep === 1 ? (
            <View style={styles.contentContainer}>
              {renderStep1()}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
                  <Text style={styles.primaryButtonText}>Next</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              {renderStep2()}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAccount}>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryButton} onPress={handlePreviousStep}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    color: '#444',
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
  },
  buttonsContainer: {
    paddingBottom: 60,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  allergiesContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default Register;