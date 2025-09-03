import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { auth } from '../utils/authPersistence';
import Background from '../components/background';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function Profile({ navigation }: Props) {
  const user = auth.currentUser;

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.replace('Login');
    });
  };

  return (
    <Background>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CULINA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profilePicWrapper}>
          <Image source={require('../assets/profile.png')} style={styles.profilePic} />
          <Text style={styles.profileName}>{user?.displayName || 'John Doe'}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Personal Details */}
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

        <TouchableOpacity style={styles.row}>
          <Image source={require('../assets/email.png')} style={styles.rowIcon} />
          <View>
            <Text style={styles.rowText}>Gmail</Text>
            <Text style={styles.rowSubText}>{user?.email || 'JohnDoe@gmail.com'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Settings')}>
          <Image source={require('../assets/personalize.png')} style={styles.rowIcon} />
          <Text style={styles.rowText}>Personalization</Text>
        </TouchableOpacity>

        {/* Others */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>OTHERS</Text>

        <TouchableOpacity style={styles.row}>
          <Image source={require('../assets/sowrong.png')} style={styles.rowIcon} />
          <Text style={styles.rowText}>Something wrong?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Image source={require('../assets/about.png')} style={styles.rowIcon} />
          <Text style={styles.rowText}>About</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOut} onPress={handleLogout}>
            <View style={styles.signOutLeft}>
              <Image source={require('../assets/logout.png')} style={styles.signOutIcon} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
            <Image source={require('../assets/signoutculina.png')} style={styles.chibiIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    paddingTop: 25 
  },
  backIcon: { width: 45, height: 45 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32 },
  profilePicWrapper: { alignItems: 'center', marginVertical: 24 },
  profilePic: { width: 80, height: 80, borderRadius: 40, marginBottom: 8, backgroundColor: '#e5e7eb' },
  profileName: { fontSize: 18, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#d1d5db', marginVertical: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowIcon: { width: 24, height: 24, marginRight: 12, resizeMode: 'contain' },
  rowText: { fontSize: 16, fontWeight: '500' },
  rowSubText: { fontSize: 14, color: '#6b7280' },

  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 8,
  },
  signOutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutIcon: {
    top:4,
    width: 70,
    height: 70,
    marginRight: 8,
    resizeMode: 'contain',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chibiIcon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
});
