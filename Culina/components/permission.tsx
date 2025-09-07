import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

import Background from './background';

const Permission = ({ navigation }: any) => {
  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../assets/back.png')} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.title}>Permission</Text>
          <Image source={require('../assets/question.png')} style={styles.icon} />
        </View>

        {/* Character Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/permission.png')}
            style={styles.character}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <View style={styles.textContainer}>
          <Text style={styles.heading}>Use Your Camera to Scan Ingredients</Text>
          <Text style={styles.subText}>
            We need access to your camera to scan ingredient labels, notes, or 
            food packages using OCR (text recognition).
          </Text>
        </View>

        {/* Spacer pushes buttons down */}
        <View style={{ flex: 1 }} />

        {/* Buttons at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.allowButton}>
            <Text style={styles.allowText}>Allow</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.denyButton}>
            <Text style={styles.denyText}>Deny</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20, 
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  icon: {
    width: 45,
    height: 45,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  character: {
    //width: 220,
    //height: 260,
  },
  textContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 40,
    marginBottom: 40, 
  },
  allowButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  allowText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  denyButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  denyText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default Permission;
