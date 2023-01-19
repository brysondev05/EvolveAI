import { useState, useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useFirestore } from 'react-redux-firebase'
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryPolarAxis,
  VictoryScatter,
  VictoryStack,
  VictoryTheme,
} from 'victory-native'
import GradientHeader from '~/components/presentational/GradientHeader'
import LargeButtonGroup from '~/components/ProgramReview/LargeButtonGroup'
import SmallButtonGroup from '~/components/ProgramReview/SmallButtonGroup'
import { useBlockColors } from '~/hooks/programInfo/useBlockColors'
import { useTypedSelector } from '~/reduxStore/reducers'
import { Defs, LinearGradient, Stop } from 'react-native-svg'

import { convertToKG, convertToLB } from '~/helpers/Calculations'
import classifications from '~/assets/data/lifterClassifications.json'
import { Layout, Text, useTheme } from '@ui-kitten/components'
import { dateToDate } from '~/helpers/Dates'

const getFreq = (frequency) => {
  if (frequency % 1 === 0) {
    return frequency
  }
  return `${Math.floor(frequency)}-${Math.ceil(frequency)}`
}

const findLowest = (items) =>
  items.sort((a, b) => a.amount - b.amount)[0]?.amount
const findHighest = (items) =>
  items.sort((a, b) => b.amount - a.amount)[0]?.amount

const convertClass = (classItem) => {
  switch (classItem) {
    case 0:
      return 'Class IV'
    case 1:
      return 'Class III'
    case 2:
      return 'Class II'
    case 3:
      return 'Class I'
    case 4:
      return 'Master Class'
    case 5:
      return 'Elite Class'
    case 6:
      return 'International Elite Class'
  }
}
// const GradientTwo = () => (
//     <Defs key={'gradient'}>
//         <LinearGradient gradientUnits="userSpaceOnUse" id={'gradientTwo'} x1={'0'} y={'0'} x2={'0'} y2={'100%'}>
//             <Stop offset={'0%'} stopColor={'#0086FF'} stopOpacity={0.9} />
//             <Stop offset={'20%'} stopColor={'#0086FF'} stopOpacity={0.5} />
//             {/* <Stop offset={'50%'} stopColor={'#0086FF'} stopOpacity={0}/> */}
//             {/* <Stop offset={'100%'} stopColor={'rgb(17, 236, 229)'}/> */}

//             <Stop offset={'80%'} stopColor={'#0086FF'} stopOpacity={0} />
//             {/* <Stop offset={'100%'} stopColor={'#E22822'} stopOpacity={0.5}/> */}

//         </LinearGradient>
//     </Defs>
// )

const MovementOverview = ({ navigation, route }) => {
  const { type, volumeData, movementDetails } = route.params || {
    type: '',
    volumeData: {},
    movementDetails: {},
  }

  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)
  const profile = useTypedSelector(({ firebase: { profile } }) => profile)
  const userBioData = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram?.programDetails?.userBioData
  )

  const { compStyle, jtsClass, max, stickingPoint } = movementDetails || null

  const colors = useBlockColors()

  const firestore = useFirestore()

  const [maxes, setMaxes] = useState(null)
  const [currentMax, setCurrentMax] = useState(null)
  const [lowest, setLowest] = useState(0)
  const [highest, setHighest] = useState(0)
  const [classes, setClasses] = useState(null)

  const theme = useTheme()
  const movementDoc =
    type === 'Squat' ? 'SQ0' : type === 'Bench' ? 'BN0' : 'DL0'

  const currentClass = () => {
    const max =
      currentMax?.units === 'kg'
        ? currentMax?.amount
        : convertToKG(currentMax?.amount)

    const base = {
      weight: 10000,
      classes: [],
      gender: 'Male',
      type: 'Deadlift',
      style: 'Classic',
    }

    const bodyweight = userBioData?.bodyweight
    const genderString = userBioData?.genderIndex === 0 ? 'Male' : 'Female'

    const genderClass = classifications[genderString]
    const lifterClass = Object.values(genderClass)
      .filter(
        (item) =>
          item.weight >= bodyweight &&
          item.style === 'Raw' &&
          item.type === type
      )
      .reduce((prev, curr) => (prev.weight <= curr.weight ? prev : curr), base)

    setClasses(lifterClass.classes)
  }
  useEffect(() => {
    const movementRecord = []
    const getRecords = async () => {
      const records = await firestore
        .collection(`users/${userID}/exercises/${movementDoc}/history`)
        .where('type', '==', 'userEntered')
        .orderBy('date', 'asc')
        .get()

      if (!records.empty) {
        records.forEach((record) => {
          const { amount, units, date, ERM } = record.data()
          const lowerERM = Number(amount)
          if (lowerERM) {
            let amountForGraph =
              units === 'kg' ? lowerERM : convertToKG(lowerERM)
            movementRecord.push({
              amount: amountForGraph,
              units: 'kg',
              date: dateToDate(date),
            })
          }
        })
      }

      setMaxes(movementRecord)

      setLowest(findHighest(movementRecord))
      setHighest(findLowest(movementRecord))

      const currentMax = await firestore
        .doc(`users/${userID}/exercises/${movementDoc}`)
        .get()

      if (currentMax.exists) {
        setCurrentMax({
          amount: currentMax.data()?.max?.amount,
          units: currentMax.data()?.max?.units,
        })
        currentClass()
      }

      return
    }
    getRecords()
  }, [])
  const volumeDataItems = [
    {
      title: 'Hypertrophy',
      description: `${volumeData.hypertrophy.MEV} / ${volumeData.hypertrophy.MRV}`,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: `${volumeData.strength.MEV} / ${volumeData.strength.MRV}`,
      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: `${volumeData.peaking.MEV} / ${volumeData.peaking.MRV}`,
      descriptionColor: colors.peakingOn,
    },
  ]

  const frequencyDataItems = [
    // {
    //     title: 'Hypertrophy',
    //     description: `${getFreq(volumeData.hypertrophy.freq)}x`,
    //     descriptionColor: colors.hypertrophyON
    // },
    // {
    //     title: 'Strength',
    //     description: `${getFreq(volumeData.strength.freq)}x`,

    //     descriptionColor: colors.strengthOn
    // },
    // {
    //     title: 'Peaking',
    //     description: `${getFreq(volumeData.peaking.freq)}x`,

    //     descriptionColor: colors.peakingOn
    // }
    {
      title: 'Hypertrophy',
      description: `${volumeData.hypertrophy.freq}x`,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: `${volumeData.strength.freq}x`,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: `${volumeData.peaking.freq}x`,

      descriptionColor: colors.peakingOn,
    },
  ]
  const periodizationDataItems = [
    {
      title: 'Hypertrophy',
      description: volumeData.hypertrophy.periodization,
      descriptionColor: colors.hypertrophyON,
    },
    {
      title: 'Strength',
      description: volumeData.strength.periodization,

      descriptionColor: colors.strengthOn,
    },
    {
      title: 'Peaking',
      description: volumeData.peaking.periodization,

      descriptionColor: colors.peakingOn,
    },
  ]

  const smallButtonGroupItems = [
    {
      title: 'Current Max',
      description: currentMax && `${currentMax.amount}${currentMax.units}`,
    },
    {
      title: 'Class',
      description: jtsClass,
    },
    {
      title: 'Competition Style',
      description: compStyle,
    },
    {
      title: 'Sticking Point',
      description: stickingPoint,
    },
  ]
  const hintColor = 'blue'

  // console.log([maxes[maxes?.length - 1]?.date, maxes[0]?.date]);

  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView style={{ flexGrow: 1 }}>
        <Layout style={{ flex: 1 }}>
          <GradientHeader title={type} />

          <Layout style={styles.mainContentWrapper}>
            {/* <GradientTwo /> */}

            {maxes && false && (
              <>
                <VictoryChart
                  height={300}
                  padding={{ top: 20, bottom: 30, left: 40, right: 50 }}
                  domainPadding={{ x: 10, y: 30 }}
                  scale={{ x: 'time' }}
                  theme={VictoryTheme.material}
                  // theme={VictoryTheme.material}
                  // domain={{y: [lowest - 50, highest + 50], x: [maxes[maxes.length - 1].date.getTime(), maxes[0].date.getTime()]}}
                >
                  {/* {classes?.map((cl, index) => (
                <VictoryLine
                  key={cl}
                  y={() => (currentMax.units === 0 ? cl : convertToLB(cl))}
                  domain={{
                    y: [lowest - 50, highest + 50],
                    x: [
                      maxes[maxes.length - 1].date.getTime(),
                      maxes[0].date.getTime(),
                    ],
                  }}
                  labels={[convertClass(index)]}
                  labelComponent={
                    <VictoryLabel dx={15} dy={-5} textAnchor='start' />
                  }
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 },
                  }}
                  style={{
                    data: {
                      stroke: theme['text-success-color'],
                      strokeWidth: 3,
                      strokeDasharray: 3,
                      strokeDashoffset: 3,
                    },
                    labels: { fill: theme['text-success-color'], fontSize: 16 },
                  }}
                />
              ))} */}

                  <VictoryLine
                    // interpolation='monotoneX'
                    animate={{
                      duration: 2000,
                      onLoad: { duration: 1000 },
                    }}
                    data={maxes}
                    x='date'
                    y='amount'
                    labels={({ datum }) => datum.amount}
                    //   domain={{y: [lowest - 50, highest + 50], x: [maxes[maxes.length - 1].date, maxes[0].date]}}
                    scale={{ x: 'time' }}
                    style={{
                      data: {
                        stroke: theme['text-primary-color'],
                        strokeWidth: 3,
                      },
                    }}
                  />

                  <VictoryScatter
                    style={{
                      data: {
                        fill: theme['text-primary-color'],
                        stroke: 'white',
                        strokeWidth: 1,
                      },
                    }}
                    size={4}
                    data={maxes}
                    x='date'
                    y='amount'
                    animate={{
                      // duration: 2000,
                      onLoad: { duration: 1000 },
                    }}
                    // domain={{y: [lowest - 50, highest + 50], x: [maxes[maxes.length - 1].date, maxes[0].date]}}
                  />
                  <VictoryAxis
                    style={{
                      axis: { stroke: hintColor },
                      axisLabel: { fontSize: 16 },
                      // grid: {stroke: ({ tick }) => tick > 8 ? "red" : "grey"},
                      ticks: { stroke: hintColor, size: 5 },
                      tickLabels: {
                        fontSize: 12,
                        fill: 'white',
                      },
                    }}
                  />
                </VictoryChart>
              </>
            )}
            <Layout style={{ marginVertical: 10 }}>
              {/* <Pressable onPress={() => navigation.navigate('Exercise History', {movementDoc })}>
                            
                            <Text status="primary" style={{ textAlign: 'right' }}>History</Text></Pressable> */}
            </Layout>
            <SmallButtonGroup items={smallButtonGroupItems} />
            <LargeButtonGroup title='MEV / MRV' items={volumeDataItems} />
            <LargeButtonGroup title='Frequency' items={frequencyDataItems} />
            <LargeButtonGroup
              title='Periodization'
              items={periodizationDataItems}
            />
          </Layout>
        </Layout>
      </ScrollView>
    </Layout>
  )
}

export default MovementOverview

const styles = StyleSheet.create({
  mainContentWrapper: {
    margin: 15,
  },
})
