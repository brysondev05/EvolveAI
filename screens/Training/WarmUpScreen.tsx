import { View, FlatList } from 'react-native'
import WarmupItem from '~/components/TrainingScreen/TrainingOverview/WarmupItem'
import warmups from '~/assets/data/warmups.json'
import GradientHeader from '~/components/presentational/GradientHeader'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Icon } from '@ui-kitten/components'
import { useCallback } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'

const WarmUpScreen = ({ navigation }) => {
  const nextIcon = (props) => <Icon {...props} name='arrow-forward-outline' />
  const insets = useSafeAreaInsets()
  //Change this because of Crash when one exercise is active & user try to enter in the another day exercise
  let movements = null
  let style = null
  //Init Blank array
  let activeDayMainLifts = []

  activeDayMainLifts = useTypedSelector(
    ({ firestore: { data } }) => data.dayInfo && data.dayInfo?.mainLifts
  )
  if (Array.isArray(activeDayMainLifts)) {
    movements = activeDayMainLifts.map(
      (lift) => lift.exercise.movement ?? lift.exercise.category
    )
  }

  const programDetails = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram?.programDetails
  )
  if (programDetails !== 'undefined') {
    const userLifterProfile = programDetails?.userLiftingData
    style = userLifterProfile.deadlift.style
  }

  const warmupKey = getWarmupsLookupKey()
  // console.log('programDetails', JSON.stringify(programDetails))
  // console.log('userLifterProgram', JSON.stringify(userLifterProfile))
  // console.log('workout style: ' + style)
  // console.log('activeDayMainLifts: ' + JSON.stringify(activeDayMainLifts))
  // console.log('movements: ' + JSON.stringify(movements))
  // console.log('warmupKey: ' + JSON.stringify(warmupKey))

  function getWarmupsLookupKey() {
    if (movements !== null && style !== null) {
      console.log('movements are: ', movements)
      if (
        ['BN', 'SQ', 'DL'].every((value) => {
          return movements.includes(value)
        })
      ) {
        return 'SBD'
      } else if (
        ['BN', 'SQ'].every((value) => {
          return movements.includes(value)
        })
      ) {
        return style == 0 ? 'BDC' : 'BDM'
      } else if (movements && movements.length == 1) {
        if (movements.includes('SQ')) {
          return 'S'
        } else if (movements.includes('BN') || movements.includes('UP')) {
          return 'B'
        } else if (movements.includes('DL')) {
          return style == 0 ? 'DC' : 'DM'
        }else {
          return 'S'
        }
      } else {
        return 'S'
      }
    }
  }

  const handleStartWorkout = useCallback(() => {
    navigation.navigate('Readiness')
  }, [])

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}>
      {warmupKey != null && (
        <FlatList
          ListHeaderComponent={() => (
            <SafeAreaView>
              <GradientHeader
                title='Warmup'
                subheading='Perform these muscle activating warmups to prepare you for your training session. Performing these before you answer your readiness questions will allow you to checkin with your body and give more accurate answers.'
              />
            </SafeAreaView>
          )}
          ListFooterComponent={
            <View style={{ paddingHorizontal: 15, marginVertical: 15 }}>
              <Button
                status='secondary'
                size='giant'
                onPress={handleStartWorkout}
                accessoryRight={nextIcon}>
                Start Training
              </Button>
            </View>
          }
          data={warmups[warmupKey]}
          renderItem={({ item, index }) => (
            <WarmupItem item={item} index={index} navigation={navigation} />
          )}
          keyExtractor={(item) => item.exerciseShortcode}
        />
      )}
    </View>
  )
}

export default WarmUpScreen
