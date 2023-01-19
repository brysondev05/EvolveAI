import { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native'
import { useExerciseChange } from '~/hooks/workout/useExerciseChange'
import { Text, useTheme, Icon } from '@ui-kitten/components'

export default function ExerciseSwapItem({ item, navigation }) {
  const handleExerciseChange = useExerciseChange({
    shortCode: item?.exerciseShortcode,
    navigation,
  })

  const theme = useTheme()
  const navigateToIndividualExercise = useCallback(() => {
    navigation.navigate('Individual Exercise No Modal', {
      exerciseID: item.exerciseShortcode,
      isExerciseSwap: true,
    })
  }, [item])
  return (
    <View
      key={item?.exerciseShortcode}
      style={{
        paddingHorizontal: 20,
        backgroundColor: theme['background-basic-color-3'],
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
        shadowRadius: 2.62,

        elevation: 4,
      }}>
      <View style={styles.exerciseRow}>
        <View style={{ flexGrow: 1, width: '50%', paddingRight: 15 }}>
          <Pressable onPress={navigateToIndividualExercise}>
            <Text category='s1'>{item?.exerciseName}</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={navigateToIndividualExercise}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 25,
            }}>
            <Icon
              style={[styles.mainIcons, {}]}
              fill={theme['text-hint-color']}
              name='info-outline'
            />
            <Text category='p2' appearance='hint'>
              Info
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleExerciseChange()}
            style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Icon
              style={[styles.mainIcons, {}]}
              fill={theme['text-hint-color']}
              name='square'
            />
            <Text category='p2' appearance='hint'>
              Select
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

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
