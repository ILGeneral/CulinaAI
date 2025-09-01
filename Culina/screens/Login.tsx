import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';

import Background from '../components/background';
import CustomCheckBox from '../components/customCheckBox';
import { auth } from '../utils/authPersistence';
import type { RootStackParamList } from '../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home', { userEmail: email });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <Background>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.mainContent}>
              <Image
                source={require('../assets/culinalogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Welcome back !</Text>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter your email address"
                  style={styles.input}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Remember Me */}
              <View style={styles.row}>
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox
                    checked={rememberMe}
                    onToggle={() => setRememberMe(!rememberMe)}
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.forgot}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Log in</Text>
              </TouchableOpacity>

              {/* Register */}
              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ alignSelf: 'flex-start' }}>
                <Text style={styles.registerText}>
                  Don't have an account?{' '}
                  <Text style={styles.registerNow}>Register Now.</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  mainContent: {
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 6,
  },
  forgot: {
    color: '#1E90FF',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#333',
  },
  registerNow: {
    color: '#1E90FF',
    fontWeight: '500',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
  },
  link: {
    color: '#1E90FF',
  },
});

export default Login;