import { Pressable } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

export const WorkoutFlowBackButton = ({ routeName, navigation, theme }) => (
  <Pressable
    onPress={() =>
      navigation.navigate(
        routeName === 'MainTrainingScreen' ? 'Readiness' : 'TrainingOverview'
      )
    }
    style={{
      marginRight: 15,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    }}>
    <Icon
      style={{ width: 35, height: 35 }}
      fill={theme['color-primary-500']}
      name='arrow-ios-back-outline'
    />
    <Text
      category='p1'
      style={{ fontSize: 17, color: theme['color-primary-500'] }}>
      {routeName === 'MainTrainingScreen' ? 'Readiness' : 'Overview'}
    </Text>
  </Pressable>
)
