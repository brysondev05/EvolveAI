import { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native'
import { useTheme, Text, Icon, Divider } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useExerciseNav } from '~/hooks/workout/useExerciseNav'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import { exerciseNiceNames } from '../ExerciseCard/ExerciseCardData'

const WarmupItem = ({
  item,
  index,
  navigation,
  currentDay,
  currentWeek,
  blockType,
  cycleID,
}) => {
  const theme = useTheme()

  const navigateToIndividualExercise = useCallback(() => {
    navigation.navigate('Individual Exercise Modal', {
      exerciseID: item?.exerciseShortcode,
      isRehab: false,
    })
  }, [item])
  return (
    <View
      style={{
        paddingHorizontal: 20,
        backgroundColor: theme['background-basic-color-4'],
        marginVertical: 5,
        marginHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 0.62,

        elevation: 2,
      }}>
      <View style={styles.exerciseRow}>
        <Pressable onPress={navigateToIndividualExercise}>
          <Text category='s1'>{item.exercise}</Text>

          <Text category='s2' appearance='hint'>
            1 x {item.notes}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={navigateToIndividualExercise}
            style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Icon
              style={[styles.mainIcons, {}]}
              fill={theme['text-hint-color']}
              name='info-outline'
            />
            <Text category='p2' appearance='hint'>
              Info
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default WarmupItem

const styles = StyleSheet.create({
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainIcons: {
    width: 20,
    height: 20,
    marginBottom: 2.5,
  },
  cardContainer: {
    marginTop: 30,
    borderRadius: 16,
    padding: 15,
    paddingLeft: 30,
    minHeight: 150,
    width: '95%',
    alignSelf: 'center',
    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 2,
    // },
    // shadowOpacity: 0.23,
    // shadowRadius: 2.62,

    // elevation: 4,
  },
  sideLine: {
    position: 'absolute',
    left: 5,
    top: 10,
    zIndex: 1000,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: 5,
  },
})
