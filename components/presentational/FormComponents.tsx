import {
  Layout,
  Text,
  useTheme,
  Button,
  Input,
  Icon,
  Datepicker,
  CalendarViewModes,
  ButtonGroup,
  RadioGroup,
  Radio,
} from '@ui-kitten/components'
import { Pressable } from 'react-native'
import { SignUpStyles } from '../../styles/SignUpStyle'
import { View } from 'react-native'
import LayoutCard from './containers/LayoutCard'
import { useState } from 'react'
import ThemeColor from '~/constants/color'

export const SuffixInput = ({ suffix, ...props }: any) => {
  const renderSuffix = (_evaProps: any) => <Text>{suffix}</Text>
  return (
    <Input
      {...props}
      style={{ backgroundColor: ThemeColor.secondary, ...props.style }}
      accessoryRight={renderSuffix}
    />
  )
}

export const PrefixInput = ({ suffix, ...props }: any) => {
  const renderPrefix = (_evaProps: any) => <Text>{suffix}</Text>
  return <Input {...props} accessoryLeft={renderPrefix} />
}

export const FormControl = ({
  label = null,
  children,
  level = '1',
  containerStyle,
}: any) => {
  const theme = useTheme()

  return (
    <Layout style={[SignUpStyles.inputGroup, containerStyle]} level={level}>
      {label && (
        <Text
          style={{
            color: theme['text-hint-color'],
          }}
          category='label'>
          {label}
        </Text>
      )}
      {children}
    </Layout>
  )
}

const bulletItem = (item, index) => (
  <View
    key={index}
    style={{ flexDirection: 'row', marginBottom: 5, paddingRight: 15 }}>
    <Icon
      style={{ width: 20, height: 20, marginRight: 10 }}
      fill={ThemeColor.appPink}
      name='checkmark-outline'
    />
    <Text category='c2'>{item}</Text>
  </View>
)

interface RadioProps {
  title: string
  description: string
  status?: string
  formStyles?: any
  points?: string[]
  checked?: boolean
}
export const RadioDescription = ({
  title,
  description,
  status,
  formStyles,
  points,
  checked,
  onChange,
  ...props
}: RadioProps) => {
  const [cardLevel, setCardLevel] = useState('3')

  const onPressIn = () => setCardLevel('2')
  const onPressOut = () => setCardLevel('3')

  const RadioDescription = (_evaProps: any) => (
    <View style={{ flex: 1 }}>
      <Text
        appearance={status === 'disabled' ? 'hint' : 'default'}
        category='h4'
        style={{ marginBottom: 5 }}>
        {title}
      </Text>

      {/* <Text
        appearance={status === 'disabled' ? 'hint' : 'default'}
        category='s1'
        style={{ marginBottom: 15 }}>
        {description}
      </Text> */}
      {points && points.map(bulletItem)}
    </View>
  )

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onChange}>
      <LayoutCard
        level={cardLevel}
        pressedIn={cardLevel === '2'}
        status={checked ? 'primary' : 'basic'}
        style={{ marginHorizontal: 0 }}>
        {/* <Radio
      {...props}
      status={status}
      disabled={status === 'disabled'}
      style={[formStyles.radioButton, { marginBottom: 10, marginTop: 10 }]}>
    
    </Radio> */}
        <RadioDescription />
      </LayoutCard>
    </Pressable>
  )
}

export const renderRadio = (title: string, index: number) => (
  <Radio key={index}>{title}</Radio>
)
export default FormControl
