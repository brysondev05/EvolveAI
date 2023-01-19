import { StyleSheet, View, TextInput, Platform } from 'react-native'
import { FormControl } from '~/components/presentational/FormComponents'
import { Button, Text, Icon, useTheme } from '@ui-kitten/components'
import useScaledFontSize from '~/hooks/utilities/useScaledFontSize'

const PlusIcon = (props) => <Icon {...props} name='plus-outline' />
const MinusIcon = (props) => <Icon {...props} name='minus-outline' />

const NumberInput = ({
  handleChange,
  value,
  onChangeText,
  units = '',
  canEdit = false,
  placeholder,
  label,
  level = '3',
  disabled = false,
  subLabel = '',
  prefix = '',
}) => {
  const fontSize = useScaledFontSize(35)
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <View>
        <Text
          category='label'
          style={{ textAlign: 'center' }}
          appearance='hint'>
          {label}{' '}
          {subLabel !== '' && (
            <Text
              category='c1'
              style={{ textAlign: 'center', fontSize: 14 }}
              appearance='hint'>
              {subLabel}
            </Text>
          )}
        </Text>
      </View>
      {!disabled && (
        <View style={styles.inputContainer}>
          <Button
            status='basic'
            appearance='ghost'
            accessoryLeft={MinusIcon}
            size='giant'
            onPress={() => handleChange('decrease')}
          />

          <FormControl
            level={level}
            containerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={[
                styles.textInputWrapper,
                units !== '' && styles.withUnits,
              ]}>
              {prefix !== '' && <Text category='h6'>{prefix}</Text>}
              <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={theme['text-hint-color']}
                editable={canEdit}
                keyboardType='decimal-pad'
                returnKeyType='done'
                style={{
                  fontSize,
                  color: theme['color-basic-default'],
                  textAlign: 'center',
                }}
              />
              {units !== '' && (
                <Text category='h6' style={{ marginLeft: 5 }}>
                  {String(units) === '1' || units === 'kg' ? 'kg' : 'lb'}
                </Text>
              )}
            </View>
          </FormControl>

          <Button
            status='basic'
            appearance='ghost'
            accessoryLeft={PlusIcon}
            size='giant'
            onPress={() => handleChange('increase')}
          />
        </View>
      )}
    </View>
  )
}

export default NumberInput

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withUnits: {
    marginLeft: 25,
  },
})
