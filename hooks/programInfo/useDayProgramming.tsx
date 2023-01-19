import { useState, useEffect } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import { isLoaded, isEmpty } from 'react-redux-firebase'
import rehab from '~/assets/data/rehab.json'
import { getBenchmarks } from '~/helpers/benchmarkTopSets/getBenchmarks'

const rehabFreq = {
  3: {
    1: ['SQ1', 'SQ2', 'BN1', 'BN2', 'DL1', 'DL2'],
    2: ['SQ3', 'BN3', 'DL3'],
    3: ['SQ4', 'SQ5', 'BN4', 'BN5', 'DL4', 'DL5'],
  },
  4: {
    1: ['SQ1', 'BN1', 'BN2', 'DL1'],
    2: ['SQ2', 'BN3', 'DL2'],
    3: ['SQ3', 'BN4', 'DL3'],
    4: ['SQ4', 'SQ5', 'BN5', 'DL4', 'DL5'],
  },
  5: {
    1: ['SQ1', 'BN1', 'DL1'],
    2: ['SQ2', 'BN2', 'DL2'],
    3: ['SQ3', 'BN3', 'DL3'],
    4: ['SQ4', 'BN4', 'DL4'],
    5: ['SQ5', 'BN5', 'DL5'],
  },
  6: {
    1: ['SQ1', 'BN1', 'DL1'],
    2: ['SQ2', 'BN2', 'DL2'],
    3: ['SQ3', 'DL3'],
    4: ['SQ4', 'BN3'],
    5: ['SQ5', 'BN4'],
    6: ['DL4', 'DL5', 'BN5'],
  },
}
const shortNames = {
  squat: 'SQ',
  bench: 'BN',
  deadlift: 'DL',
}

const groupBy = function (xs: any[], key: string) {
  return xs.reduce(function (rv, x, i) {
    let itemKey = x[key] || `acc${i}`

    ;(rv[itemKey] = rv[itemKey] || []).push(x)
    return rv
  }, {})
}

export default function useDayProgramming() {
  const exercisesWithSettings = useTypedSelector(
    ({ firestore: { data } }) => data.exercises
  )

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userProgramData
  )
  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered?.dayInfo?.[0]
  )

  const activeWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks &&
      data.dayInfo &&
      data.programWeeks?.[`week${activeDay?.week}`]
  )
  const [allLiftingData, setAllLiftingData] = useState([])
  const [liftsToFind, setLiftsToFind] = useState([])

  const activeDayMainLifts = useTypedSelector(
    ({ firestore: { data } }) => data.dayInfo && data.dayInfo?.mainLifts
  )
  const activeDayAccLifts = useTypedSelector(
    ({ firestore: { data } }) => data.dayInfo && data.dayInfo?.accLifts
  )

  useEffect(() => {
    let availableAccessories = [{ exercise: { category: '', movement: '' } }]
    let availableMainLifts = [{ exercise: { category: '', movement: '' } }]
    let rehabProgram = []
    let rehabLiftsToFind = []
    let canContinue = true
    if (
      canContinue &&
      ((isLoaded(activeDay) && !isEmpty(activeDayMainLifts)) ||
        (isLoaded(activeDay) && !isEmpty(activeDayAccLifts)))
    ) {
      const day =
        activeDay?.day || Number(activeDay?.id[activeDay?.id.length - 1])

      const accessoriesToFind = activeDayAccLifts
        ? activeDayAccLifts.filter(
            (lift) =>
              lift?.exercise?.exerciseShortcode &&
              (lift.sets || lift.isBridge || lift.topSets || lift.isTaper)
          )
        : []

      const nonAccs = activeDayAccLifts
        ? activeDayAccLifts.filter(
            (lift) =>
              lift?.exercise?.exerciseShortcode && !lift.sets && !lift.isBridge
          )
        : []

      availableMainLifts = activeDayMainLifts.map((l) => ({
        ...l,
        isAccessory: false,
      }))

      if (activeDay.rehab) {
        const liftsToRehab = Object.entries(
          activeDay.rehab.movementsToRehab
        ).filter(([key, val]) => val)

        const rehabLifts = liftsToRehab.map(([key, val]) => shortNames[key])

        availableMainLifts = availableMainLifts.filter(
          (lift) => !rehabLifts.includes(lift.exercise.movement)
        )

        const rehabWeeks = liftsToRehab.reduce((acc, val) => {
          acc[shortNames[val[0]]] = activeDay.rehab.rehabWeeks[val[0]]
          return acc
        }, {})

        //Catch final phase days longer than 6 days
        const trainingLength =
          activeWeek?.trainingDayStatus?.length > 6
            ? 6
            : activeWeek?.trainingDayStatus?.length

        const rehabDayToFind = day > 6 ? day - 6 : day

        const rehabDay = rehabFreq[trainingLength || 3][
          rehabDayToFind || 1
        ].filter((day) => rehabLifts.includes(day.substr(0, 2)))

        rehabProgram = rehab.filter(
          (program) =>
            rehabDay.includes(program.code.substr(0, 3)) &&
            +program.week - 1 === rehabWeeks[program.movement]
        )

        rehabLiftsToFind = [...rehabProgram]
        rehabLifts.forEach((lift) =>
          rehabLiftsToFind.push({ exercise: { exerciseShortcode: `${lift}0` } })
        )
      }
      const allLifts = [
        ...rehabLiftsToFind,
        ...availableMainLifts,
        ...accessoriesToFind,
      ]
      availableAccessories = activeDayAccLifts
        ? activeDay?.accLifts
            ?.filter(
              (lift) =>
                lift.sets || lift.isBridge || lift.topSets || lift.isTaper
            )
            .map((l) => ({ ...l, isAccessory: true }))
        : []

      const superAcc =
        userProgram?.programIndex === 0 ||
        ['R', 'B'].includes(activeDay?.blockType?.[0]) ||
        !activeDay?.blockType ||
        (activeDay?.blockType?.[0] === 'P' &&
          activeDay?.blockType?.[1] === activeDay?.blockType?.[2]) ||
        activeDay?.isTaper
          ? availableAccessories
          : Object.values(groupBy(availableAccessories, 'accID'))

      const newLiftsToFind = allLifts.reduce((acc, lift, index) => {
        if (lift?.exercise?.exerciseShortcode) {
          acc.push(lift?.exercise?.exerciseShortcode)
        }
        return acc
      }, [])

      if (JSON.stringify(newLiftsToFind) !== JSON.stringify(liftsToFind)) {
        setLiftsToFind(newLiftsToFind)
      }

      const finalLiftingData = [
        ...rehabProgram,
        ...availableMainLifts,
        ...superAcc,
      ]

      if (isLoaded(exercisesWithSettings)) {
        const finalLiftingDataWithBenchmarks = getBenchmarks({
          dayProgramming: finalLiftingData,
          blockType: activeDay.blockType,
          exercisesWithSettings,
        })

        setAllLiftingData(finalLiftingDataWithBenchmarks)
      } else {
        setAllLiftingData(finalLiftingData)
      }
    }
    return () => {
      canContinue = false
    }
  }, [activeDay, exercisesWithSettings])

  if (isLoaded(activeDay) && isLoaded(activeWeek)) {
    return {
      allLiftingData,
      activeWeek,
      activeDay,
      liftsToFind,
    }
  }
  return {
    allLiftingData: null,
    activeWeek: null,
    activeDay: null,
    liftsToFind: null,
  }
}
