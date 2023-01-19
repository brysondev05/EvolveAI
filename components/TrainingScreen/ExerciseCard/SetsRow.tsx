import { useCallback } from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { Pressable } from 'react-native'
import SetRow from './SetRow'
import BridgeMainLiftHeader from './SetsRepsDescriptions/Powerlifting/Bridge/BridgeMainLift'
import BridgeAccessoryLiftHeader from './SetsRepsDescriptions/Powerlifting/Bridge/BridgeAccessoryLift'
import CarryingExerciseHeader from './SetsRepsDescriptions/Powerlifting/Bridge/CarryingExercise'
import JumpingExerciseHeader from './SetsRepsDescriptions/Powerlifting/Bridge/JumpingExercise'
import AbExerciseHeader from './SetsRepsDescriptions/Powerlifting/Bridge/AbExercise'
import TopSetHeader from './SetsRepsDescriptions/Powerlifting/TopSet'
import DropSetHeader from './SetsRepsDescriptions/Powerlifting/DropSet'
import StraightSetHeader from './SetsRepsDescriptions/Powerlifting/StraightSet'

export default function ({
  exerciseIndex,
  lift,
  setValues,
  color,
  exerciseDetails,
  currentWeek,
  currentDay,
  exerciseType,
  setUserAddedSets,
  isPerSide,
}) {
  const SetDisplay = useCallback(
    (set, index) => {
      if (index === 0) {
        switch (exerciseType) {
          case 'bridgeMainLift':
            return BridgeMainLiftHeader({
              lift,
              set,
              exerciseDetails,
              isPerSide,
            })
          case 'bridgeAccessory':
            return BridgeAccessoryLiftHeader({
              lift,
              set,
              exerciseDetails,
              isPerSide,
            })
          case 'specialBridgeMovement':
            if (exerciseDetails.primaryCategory === 'CE') {
              return CarryingExerciseHeader({
                lift,
                set,
                exerciseDetails,
                setValues,
                isPerSide,
              })
            }
            if (exerciseDetails.primaryCategory === 'JP') {
              return JumpingExerciseHeader({
                lift,
                set,
                exerciseDetails,
                setValues,
                isPerSide,
              })
            }
            if (exerciseDetails.primaryCategory === 'AB') {
              return AbExerciseHeader({
                lift,
                set,
                exerciseDetails,
                setValues,
                isPerSide,
              })
            }
          case 'regularMainLift':
            if (set.type === 'topSet' || set.type === 'benchmarkSet') {
              return TopSetHeader({ set, exerciseDetails, isPerSide })
            }
            if (set.type === 'straightSets') {
              return StraightSetHeader({
                set,
                exerciseDetails,
                setValues,
                isPerSide,
              })
            }
          case 'regularAccessory':
            return StraightSetHeader({
              set,
              exerciseDetails,
              setValues,
              isPerSide,
            })
          case 'setProgram':
            if (set.type === 'topSet' || set.type === 'benchmarkSet') {
              return TopSetHeader({ set, exerciseDetails, isPerSide })
            }
            if (set.type === 'straightSets') {
              return StraightSetHeader({
                set,
                exerciseDetails,
                setValues,
                isPerSide,
              })
            }
          default:
            return null
        }
      }

      // 2nd benchmark
      if (set.type === 'benchmarkSet' && index === 1) {
        return TopSetHeader({ set, exerciseDetails, isPerSide })
      }

      // back off sets after benchmark set(s)
      if (
        (index === 1 || index === 2) &&
        ['regularMainLift', 'setProgram'].includes(exerciseType) &&
        setValues[index - 1].type === 'benchmarkSet' &&
        set.type === 'dropSet'
      ) {
        return DropSetHeader({ set, exerciseDetails, setValues, isPerSide })
      }

      if (
        index === 1 &&
        ['regularMainLift', 'setProgram'].includes(exerciseType) &&
        set.hasDrop
      ) {
        return DropSetHeader({ set, exerciseDetails, setValues, isPerSide })
      }
    },
    [setValues, lift, exerciseDetails]
  )

  let lastIndexWithHeader = 0

  return (
    <View>
      {setValues.map((set, index) => {
        const header = SetDisplay(set, index)

        if (header) {
          lastIndexWithHeader = index
        }

        return (
          <View key={index}>
            {header}

            <SetRow
              setValues={setValues}
              color={color}
              key={index}
              set={set}
              setIndex={index + 1}
              setNumber={index - lastIndexWithHeader + 1}
              exerciseDetails={exerciseDetails}
              exerciseIndex={exerciseIndex}
              currentWeek={currentWeek}
              currentDay={currentDay}
              exerciseType={exerciseType}
              lift={lift}
              setUserAddedSets={setUserAddedSets}
              isPerSide={isPerSide}
            />
          </View>
        )
      })}
    </View>
  )
}
