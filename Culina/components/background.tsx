// Background.tsx
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type BackgroundProps = {
  children?: ReactNode;
};

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
    <LinearGradient
        colors={['#80d0ff', '#ffffff']}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
        style={StyleSheet.absoluteFill}
    />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Background;