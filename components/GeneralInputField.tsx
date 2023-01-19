import { Layout, Text, Divider } from '@ui-kitten/components'
import { StyleSheet, View } from 'react-native'
import { SuffixInput } from './presentational/FormComponents'

const GeneralInputField = ({
  level = '2',
  title,
  value,
  suffix = '',
  keyboard = 'default',
  disabled = false,
  onSubmit,
  onChange,
}) => {
  return (
    <Layout level={level}>
      <View
        style={{
          justifyContent: 'space-between',
          padding: 20,
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Text appearance='hint' category='label'>
          {title}
        </Text>
        <SuffixInput
          placeholder={`Enter ${title}`}
          status='basic'
          value={value}
          style={{
            flex: 1,
            marginLeft: 20,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
          }}
          keyboardType={keyboard}
          suffix={suffix}
          textAlign='right'
          returnKeyType='done'
          disabled={disabled}
          onChangeText={(next) => onChange(next)}
          onSubmitEditing={(val) => onSubmit(val.nativeEvent.text)}
        />
      </View>
      <Divider />
    </Layout>
  )
}

export default GeneralInputField
