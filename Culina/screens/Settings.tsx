import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import type { RootStackParamList } from '../App';

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
  'Maintain weight',
  'Lose weight',
  'Gain weight',
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Settings = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User preferences
  const [dietaryLifestyle, setDietaryLifestyle] = useState('');
  const [allergies, setAllergies] = useState('');
  const [religiousPractice, setReligiousPractice] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        navigation.goBack();
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDietaryLifestyle(userData.dietaryLifestyle || '');
        setAllergies(userData.allergies || '');
        setReligiousPractice(userData.religiousPractice || '');
        setCalorieGoal(userData.calorieGoal || '');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        dietaryLifestyle,
        allergies,
        religiousPractice,
        calorieGoal,
        updatedAt: new Date(),
      }, { merge: true });

      Alert.alert('Success', 'Preferences saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage your dietary preferences and settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          
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
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={allergies}
              onValueChange={setAllergies}
              mode="dropdown"
            >
              <Picker.Item label="Select one or more allergies" value="" />
              {allergyOptions.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
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
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Settings;
