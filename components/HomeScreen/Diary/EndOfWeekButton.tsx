import { StyleSheet, View } from 'react-native'
import { Button, Icon } from '@ui-kitten/components'
import * as Animatable from 'react-native-animatable'

const backAgain = {
  0: {
    transform: [{ translateX: -10 }],
  },
  0.5: {
    transform: [{ translateX: 10 }],
  },
  1: {
    transform: [{ translateX: -10 }],
  },
}
const nextIcon = (props) => {
  return (
    <Animatable.View
      useNativeDriver={true}
      animation={backAgain}
      easing='ease'
      delay={0}
      duration={1000}
      iterationCount='infinite'>
      <Icon {...props} name='arrow-forward-outline' />
    </Animatable.View>
  )
}

const CompleteIcon = (props) => (
  <Icon {...props} name='checkmark-circle-outline' />
)

const PendingCompleteProgramButton = ({ navigation, activeWeek }) => (
  <View style={styles.buttonContainer}>
    <Button
      appearance='ghost'
      status='danger'
      onPress={() =>
        navigation.navigate('End of program', {
          week: activeWeek?.startingWeek,
          blockType: activeWeek?.blockType,
          blockVolume: activeWeek?.blockVolume,
          cycleID: activeWeek?.cycleID,
        })
      }>
      Complete Program
    </Button>
  </View>
)
const PendingEndOfWeekButton = ({ pendingDays, handleEndOfWeek }) => (
  <View style={styles.buttonContainer}>
    <Button
      appearance={pendingDays?.length > 0 ? 'ghost' : 'filled'}
      status={pendingDays?.length > 0 ? 'basic' : 'secondary'}
      size='large'
      accessoryRight={pendingDays?.length > 0 ? null : nextIcon}
      onPress={handleEndOfWeek}>
      Complete Week
    </Button>
  </View>
)
const EndOfWeekCompletedButton = ({ handleEndOfWeek }) => (
  <View style={styles.buttonContainer}>
    <Button
      status='success'
      size='large'
      onPress={handleEndOfWeek}
      accessoryRight={CompleteIcon}>
      Week Complete
    </Button>
  </View>
)

const EndOfWeekButton = ({
  activeWeek,
  navigation,
  pendingDays,
  handleEndOfWeek,
}) => {
  if (activeWeek?.blockType === 'FinalPhase') {
    return (
      <PendingCompleteProgramButton
        navigation={navigation}
        activeWeek={activeWeek}
      />
    )
  }
  if (activeWeek?.status === 'pending') {
    return (
      <PendingEndOfWeekButton
        pendingDays={pendingDays}
        handleEndOfWeek={handleEndOfWeek}
      />
    )
  }
  if (activeWeek?.status === 'complete') {
    return <EndOfWeekCompletedButton handleEndOfWeek={handleEndOfWeek} />
  }
  return null
}
export default EndOfWeekButton

const styles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
})
