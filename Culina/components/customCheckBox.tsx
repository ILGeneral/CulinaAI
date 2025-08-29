import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

type Props = {
  checked: boolean;
  onToggle: () => void;
};

const customCheckBox: React.FC<Props> = ({ checked, onToggle }) => {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.box}>
      {checked && <View style={styles.innerBox} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginRight: 8,
  },
  innerBox: {
    width: 12,
    height: 12,
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
});

export default customCheckBox;