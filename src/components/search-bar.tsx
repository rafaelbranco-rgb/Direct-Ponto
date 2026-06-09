import { StyleSheet, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar' }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* lupa em texto para não depender de pacote de ícones nesta v1 */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={`🔎  ${placeholder}`}
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
    backgroundColor: Brand.searchBg,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    height: 42,
    color: Brand.onPrimary,
    fontSize: 16,
  },
});
