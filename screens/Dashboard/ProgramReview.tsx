import { useMemo, useState } from 'react'
import {
  Layout,
  Text,
  useTheme,
  Divider,
  Icon,
  Button,
  Toggle,
} from '@ui-kitten/components'
import { View, Animated, Pressable } from 'react-native'
import CycleStructureChart from '~/components/CycleStructureChart'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import moment from 'moment-timezone'
import GradientHeader from '~/components/presentational/GradientHeader'
import useActiveWeek from '~/hooks/programInfo/useActiveWeek'
import MovementOverview from '~/components/MovementOverview'
import { ButtonSwitch } from '~/components/presentational/buttons/ButtonSwitch'
import { convertToLB } from '~/helpers/Calculations'
import { dateToDate } from '~/helpers/Dates'

type TCardRow = {
  label: string
  value: string
  labelColor?: string
}
const CardRow = ({ label, value, labelColor }: TCardRow) => (
  <View
    style={{
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginBottom: 7.5,
      alignItems: 'center',
    }}>
    <Text category='s1' style={{ width: '55%' }}>
      {label}
    </Text>
    <Text style={{ flex: 1, textAlign: 'left' }} category='s1'>
      {value}
    </Text>
  </View>
)

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// const trainingAgeValues = ['Less than 4 years', '4-6 years', '8+ years'];
// const dietValues = ['Lose', 'Maintain', 'Gain'];
// const nutritionValues = ['macros and meal timing', 'no macros'];
// const trainingDaysValues = ['3 Days', '4 Days', '5 Days', '6 Days'];
// const lastTrainingDays = ['Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
// const bridgeOptions = ["2 - 4 Weeks", "4 - 6 Weeks", "6 - 8 Weeks"];

const benchTechniqueOptions = ['Narrow Grip', 'Standard Grip', 'Wide Grip']
const squatTechniqueOptions = ['High bar', 'Low bar']
const deadliftTechniqueOptions = ['Conventional', 'Sumo']

const squatWeaknessOptions = ['Rounding Over', 'In the hole', 'Above parallel']
const benchWeaknessOptions = ['Off the chest', 'Midrange', 'Lockout']
const deadliftWeaknessOptions = ['Off the floor', 'Midrange', 'Lockout']

const lifterClasses = [
  'Class IV',
  'Class III',
  'Class II',
  'Class I',
  'Master',
  'Elite',
  'Int. Elite',
]

const programFocusOptions = ['70% PL', '60% PL', '50% PL', '40% PL', '30% PL']
const upperFocus = ['Back', 'Biceps', 'Chest', 'Shoulders', 'Triceps']
const lowerFocus = ['Calves', 'Glutes', 'Hamstrings', 'Quads']

const lifeStressOptions = [
  'Low stress job/low activity lifestyle',
  'Low stress job/high activity lifestyle',
  'Moderate stress job/moderate activity',
  'High stress job/low activity lifestyle',
  'High stress job/high activity lifestyle',
]

const trainingRecovery = [
  'Feel sore 3-4 days after training',
  'Feel sore 3 days after training',
  'Feel sore 2 days after training',
  'Feel sore 1 day after training',
  'Rarely sore no matter the training load',
]

const sleepOptions = [
  'Less than 5 hours',
  'Between 5 and 7 hours',
  'More than 7 hours',
]

const diet = ['Losing Weight', 'Maintaining Weight', 'Gaining Weight']

const trainingFrequency = [
  'Very Low Volume (1x per week, per lift) ',
  'Low Volume (1-2x per week, plus accessories)',
  'Medium Volume (2-3x per week, per lift)',
  'Medium-High Volume (2-3x per week, per lift, plus accessories)',
  'High Volume (4x or more per week)',
]

const phaseOrder = {
  hypertrophy: 1,
  strength: 2,
  peaking: 3,
}
const volumeDataOrder = {
  MEV: 1,
  MRV: 2,
  periodization: 3,
  freq: 4,
  totalFreq: 5,
}

const RenderVolumeData = ({ type, value, color, index, arr }) => (
  <View>
    <Text category='h6' style={{ marginBottom: 5, color }}>
      {capitalizeFirstLetter(type)}
    </Text>
    {Object.entries(value)
      .sort(
        ([keyA, valA], [keyB, valB]) =>
          volumeDataOrder[keyA] - volumeDataOrder[keyB]
      )
      .map(([key, value]) => (
        <CardRow key={key} label={key} value={value} />
      ))}
    {index < arr.length - 1 && <Divider style={{ marginVertical: 15 }} />}
  </View>
)

// const sortAndReturn = (data) => {
//     return data && Object.entries(data).sort(([keyA, valA], [keyB, valB]) => phaseOrder[keyA] - phaseOrder[keyB]).map(([key, value], index, arr) => {

//         let color = 'grey'

//         if (key === 'hypertrophy' || key === 'strength' || key === 'peaking') {
//             color = colors[key]
//         }
//         return <RenderVolumeData key={key} type={key} value={value} color={color} index={index} arr={arr} />
//     })
// }

/**
 * TODO: Refactor and remove freq.
 * TODO: Add info helpers
 * @param param0
 */
export default function ProgramReview({ navigation, route }) {
  const userName = useTypedSelector(({ firebase: { profile } }) => profile.name)

  const { activeWeek } = useActiveWeek()

  const theme = useTheme()

  const dispatch = useDispatch()

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )
  const hintColor = theme['color-basic-600']

  const actualMeetDate = dateToDate(userProgram?.cycleStructure?.meetDate)
  const userRole = useTypedSelector(
    ({ firebase: { profile } }) => profile?.role
  )
  if (!userProgram || typeof userProgram.programDetails === 'undefined') {
    return <Layout />
  }

  const {
    programDetails: { userLiftingData, userProgramData, userBioData },
    volumeData: programVolumeData,
    cycleStructure: programCycle,
  } = userProgram

  const programOverviewRows = [
    {
      label: 'Program Style',
      value:
        userProgramData?.programIndex === 1 ? 'Powerbuilding' : 'Powerlifting',
    },
    {
      label: 'Start Date',
      value: moment
        .tz(dateToDate(programCycle?.startDate), userProgramData?.timezone)
        .format('ddd, MMM Do YYYY'),
    },
    // {
    //     label: 'Program Length',
    //     value: `${programCycle.cycleWeeks} weeks`
    // },

    {
      label: 'Peaking Start',
      value: moment
        .tz(
          dateToDate(programCycle?.peak?.peakStart),
          userProgramData?.timezone
        )
        .format('ddd, MMM Do YYYY'),
    },
    // {
    //     label: 'Peaking Style',
    //     value: `${programCycle.peak?.peakLength}`
    // },

    {
      label: 'Taper Start',
      value: moment
        .tz(
          dateToDate(programCycle?.peak?.taperStart),
          userProgramData?.timezone
        )
        .format('ddd, MMM Do YYYY'),
    },
    // {
    //     label: 'Taper Length',
    //     value: `${programCycle.peak?.taperLength} days`
    // },
    {
      label: 'Test/Meet Date',
      value: moment
        .tz(dateToDate(programCycle?.meetDate), userProgramData?.timezone)
        .format('ddd, MMM Do YYYY'),
    },

    // {
    //     label: 'Taper Style',
    //     value: programCycle.peak?.taperStyle
    // },
    // {
    //     label: 'Peaking Modifiers (type, reduction, freq)',
    //     value: `${Object.values(programCycle?.peak.modifiers)}`
    // }

    // {
    //     label: 'Training Days',
    //     value: 'coming soon'
    // }
  ]

  const powerBuildingData = [
    {
      label: 'Program Focus',
      value: programFocusOptions[userProgramData?.powerbuilding?.plFocus],
    },
    {
      label: 'Upper Focus',
      value: upperFocus[userProgramData?.powerbuilding?.upperFocus],
    },
    {
      label: 'Lower Focus',
      value: lowerFocus[userProgramData?.powerbuilding?.lowerFocus],
    },
  ]
  const squatDetails = {
    compStyle: squatTechniqueOptions[userLiftingData?.squat?.style],
    jtsClass: lifterClasses[userLiftingData.squat?.class],
    max: `${userLiftingData?.squat?.max}kg`,
    stickingPoint: squatWeaknessOptions[userLiftingData?.squat?.weakness],
  }
  const benchDetails = {
    compStyle: benchTechniqueOptions[userLiftingData?.bench?.style],
    jtsClass: lifterClasses[userLiftingData?.bench?.class],
    max: `${userLiftingData?.bench?.max}kg`,
    stickingPoint: benchWeaknessOptions[userLiftingData?.bench?.weakness],
  }

  const deadliftDetails = {
    compStyle: deadliftTechniqueOptions[userLiftingData?.deadlift?.style],
    jtsClass: lifterClasses[userLiftingData?.deadlift?.class],
    max: `${userLiftingData?.deadlift?.max}kg`,
    stickingPoint: deadliftWeaknessOptions[userLiftingData?.deadlift?.weakness],
  }

  const meetDate = useMemo(() => {
    if (actualMeetDate) {
      const convDate = moment.tz(actualMeetDate, userProgramData?.timezone)
      return convDate.diff(
        moment.tz({ hours: 0 }, userProgramData?.timezone),
        'days'
      )
    }
    return null
  }, [actualMeetDate])

  const programOverviewHeader = () => (
    <Pressable
      onPress={() =>
        dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'volumeData' })
      }
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text category='h1'>Your Program</Text>
      <Icon
        style={{ width: 25, height: 25, marginTop: 5, marginLeft: 10 }}
        fill={hintColor}
        name='info-outline'
      />
    </Pressable>
  )

  const [activeProgram, setActiveProgram] = useState(
    userProgramData?.programIndex || 0
  )

  const currentProgramVolume =
    activeProgram === 0 ? programVolumeData : programVolumeData.programVolume

  const bioData = [
    { label: 'User', value: userName },
    {
      label: 'Age',
      value: userBioData?.age,
    },
    {
      label: 'Bodyweight',
      value: `${convertToLB(userBioData?.bodyweight)}lb`,
    },
    {
      label: 'Height',
      value: `${Math.round(userBioData?.height / 2.54)}"`,
    },
    {
      label: 'Gender',
      value: userBioData?.genderIndex === 0 ? 'Male' : 'Female',
    },
    {
      label: 'Life Stress',
      value: lifeStressOptions[userBioData?.lifeStress],
    },
    {
      label: 'Historic Recovery',
      value: trainingRecovery[userBioData?.historicRecovery],
    },
    {
      label: 'Historic Workload',
      value: trainingFrequency[userBioData?.historicWorkload],
    },
    {
      label: 'Sleep',
      value: sleepOptions[userBioData?.sleep],
    },
    {
      label: 'Diet Goal',
      value: diet[userBioData?.dietGoal],
    },
  ]

  return (
    <Layout style={{ flex: 1 }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}>
        <GradientHeader HeaderComponent={programOverviewHeader} />
        <View style={{ paddingHorizontal: 15, marginTop: 30 }}>
          <View style={{ marginBottom: 5 }}>
            <Text category='h4'>Cycle Overview</Text>
          </View>
          <Layout level='4' style={{ borderRadius: 14, paddingTop: 15 }}>
            {meetDate !== null && (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text category='h2'>{meetDate} Days Out</Text>

                <Text
                  category='h6'
                  appearance='hint'
                  style={{ marginTop: 0, marginBottom: 20 }}>
                  {moment
                    .tz(actualMeetDate, userProgramData?.timezone)
                    .format('dddd, MMMM Do YYYY')}
                </Text>
              </View>
            )}
            <CycleStructureChart
              activeWeek={activeWeek && activeWeek?.startingWeek}
              isProgramReview
            />
            <View style={{ marginVertical: 15, paddingHorizontal: 15 }}>
              {userRole === 'admin' &&
                bioData.map((item, index) => (
                  <CardRow key={index} label={item.label} value={item.value} />
                ))}
              {programOverviewRows.map((item, index) => (
                <CardRow key={index} label={item.label} value={item.value} />
              ))}
              {userProgramData.programIndex === 1 &&
                powerBuildingData.map((item, index) => (
                  <CardRow key={index} label={item.label} value={item.value} />
                ))}
            </View>
          </Layout>
        </View>

        {programVolumeData?.powerbuilding && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 5,
              transform: [{ translateY: 10 }],
            }}>
            <ButtonSwitch
              onSelect={setActiveProgram}
              selectedIndex={activeProgram}>
              <Button size='small'>Powerlifting</Button>
              <Button size='small'>Powerbuilding</Button>
            </ButtonSwitch>
          </View>
        )}

        <MovementOverview
          type='Squat'
          movementDetails={squatDetails}
          volumeData={currentProgramVolume?.squat}
          navigation={navigation}
        />
        <MovementOverview
          type='Bench'
          movementDetails={benchDetails}
          volumeData={currentProgramVolume?.bench}
          navigation={navigation}
        />
        <MovementOverview
          type='Deadlift'
          movementDetails={deadliftDetails}
          volumeData={currentProgramVolume?.deadlift}
          navigation={navigation}
        />
        {activeProgram === 1 && (
          <>
            <MovementOverview
              type='Upper Pulling'
              movementDetails={benchDetails}
              volumeData={currentProgramVolume.upperPull}
              navigation={navigation}
              seeMore={false}
            />

            {Object.entries(programVolumeData.programVolume.accessories)
              .sort(([aKey], [bKey]) => (aKey < bKey ? -1 : 1))
              .map(([key, val]) => (
                <MovementOverview
                  key={key}
                  type={key}
                  volumeData={val}
                  navigation={navigation}
                  isAccessory
                />
              ))}
          </>
        )}

        <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
          <Button
            appearance='outline'
            status='secondary'
            onPress={() => navigation.navigate('ProgramSettings')}>
            Modify Program
          </Button>
        </View>
      </Animated.ScrollView>
    </Layout>
  )
}
