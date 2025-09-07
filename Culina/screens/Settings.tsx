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
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../utils/authPersistence';
import { db } from '../firebaseConfig';
import { updateUserData } from '../utils/firestore';
import CustomCheckBox from '../components/customCheckBox';
import type { RootStackParamList } from '../App';

import Background from '../components/background';

const dietaryOptions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Low-Carb',
];

const allergyOptions = ['Peanuts', 'Tree nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish'];

const religiousOptions = ['None', 'Halal', 'Kosher', 'Buddhist', 'Hindu', 'Other'];

const calorieOptions = ['Maintain weight', 'Lose weight', 'Gain weight'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Settings = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User preferences
  const [dietaryLifestyle, setDietaryLifestyle] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
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
        setAllergies(userData.allergies || []);
        setReligiousPractice(userData.religiousPractice || '');
        setCalorieGoal(userData.calorieGoal || '');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
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

      await updateUserData(user.uid, {
        dietaryLifestyle,
        allergies,
        religiousPractice,
        calorieGoal,
      });

      Alert.alert('Success', 'Preferences saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Background>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Top header with back + icon + title */}
            <View style={styles.topHeader}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Image
                  source={require('../assets/back.png')} // back arrow image
                  style={styles.backIcon}
                />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Image
                  source={require('../assets/personalize.png')} // header icon
                  style={styles.headerIcon}
                />
                <Text style={styles.headerTitle}>Personalization</Text>
              </View>
            </View>

            {/* Subtitle / instruction text */}
            <Text style={styles.subtitle}>
              You’re in control. Change your preferences anytime to keep your recipes fresh and relevant.
            </Text>

            {/* Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Dietary Lifestyle</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={dietaryLifestyle}
                  onValueChange={setDietaryLifestyle}
                  mode="dropdown"
                >
                  <Picker.Item label="Select your dietary lifestyle" value="" />
                  {dietaryOptions.map((opt) => (
                    <Picker.Item key={opt} label={opt} value={opt} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Allergies</Text>
              {allergyOptions.map((allergy) => (
                <View key={allergy} style={styles.checkboxRow}>
                  <CustomCheckBox
                    checked={allergies.includes(allergy)}
                    onToggle={() => toggleAllergy(allergy)}
                  />
                  <Text style={styles.checkboxLabel}>{allergy}</Text>
                </View>
              ))}

              <Text style={styles.label}>Religious/Cultural Dietary Practices</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={religiousPractice}
                  onValueChange={setReligiousPractice}
                  mode="dropdown"
                >
                  <Picker.Item
                    label="Select religious or cultural dietary practices"
                    value=""
                  />
                  {religiousOptions.map((opt) => (
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
                  {calorieOptions.map((opt) => (
                    <Picker.Item key={opt} label={opt} value={opt} />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={savePreferences}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  backButton: {
    paddingRight: 15,
  },
  backIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default Settings;
