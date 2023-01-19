import { Pressable } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

export const SkipWarmupButton = ({ navigation, theme }) => (
  <Pressable
    onPress={() => navigation.navigate('Readiness')}
    style={{
      marginRight: 15,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    }}>
    <Text
      category='p1'
      style={{ fontSize: 17, color: theme['color-danger-500'] }}>
      Skip
    </Text>
    <Icon
      style={{ width: 35, height: 35 }}
      fill={theme['color-danger-500']}
      name='arrow-ios-forward-outline'
    />
  </Pressable>
)
