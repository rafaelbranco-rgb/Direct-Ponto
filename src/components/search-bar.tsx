import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Brand } from '@/constants/brand';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar' }: Props) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={Brand.searchPlaceholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Brand.searchPlaceholder}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Brand.searchBg,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 42,
    color: Brand.onPrimary,
    fontSize: 16,
    // Remove o anel de foco azul do navegador (web), igual aos demais campos.
    ...Platform.select({ web: { outlineStyle: 'none' } as object, default: {} }),
  },
});
