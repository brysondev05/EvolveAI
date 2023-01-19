import { useRef, useEffect } from 'react'
import { Linking, Pressable, StyleSheet, View } from 'react-native'
import BottomSheet from 'reanimated-bottom-sheet'
import Animated from 'react-native-reanimated'
import { Icon, Layout, Text } from '@ui-kitten/components'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'
import InlineVideo from './InlineVideo'
import { useDimensions } from '~/hooks/utilities/useDimensions'
import { blockColors } from '~/theme'

const { block, set, greaterThan, lessThan, Value, cond, sub } = Animated

const endOfBlockReview = [
  "Welcome to your end of block review. Here you'll see your planned volume profile for your next block and any adjustments made based on your readiness levels and performance of the block you just completed.",
]
const meetDayInfo = [
  'Welcome to your big day! Now is the time to put all your hard work together and perform the best Squat, Bench and Deadlift you can.',
  'The suggested attempts are based on your progress throughout the program but use your best judgement, especially when warming up, to pick your third, and heaviest attempt.',
  'If you would like to pick your third attempt but have our AI suggest your first and second attempts then simply adjust the estimated max.',
  'We highly recommend that you keep a hard copy of all your attempts should your device or the app be unavailable to you during your meet.',
]
const rasInfo = [
  'RAS aka Recovery Adaptive Strategies are passive and active means to help decay fatigue and improve your recovery.',
  'The most important aspects of recovery are training within your volume landmarks, proper sleep and eating enough, but these other RAS can be utilized during Deloads, Tapers or unique circumstances of particularly low readiness, to help you boost your recovery.',
  'Some of our favorite RAS are Ice Baths and Contrast Baths/Showers.',
]

const volumeDataInfo = [
  {
    header: 'MRV',
    info: 'Maximum Recoverable Volume is the most amount of training that you can effectively recover from. We refer to this as a specific number of sets and that number of sets will be unique to each phase of training.',
  },
  {
    header: 'MEV',
    info: 'Minimum Effective Volume is the least amount of training that will produce a positive effect for you in muscle size or strength. We refer to this as a specific number of sets and that number of sets will be unique to each phase of training.',
  },
  {
    header: 'Frequency',
    info: 'Frequency refers to how often you are training, this is both total training sessions (chosen by you) and overloading sessions for each of the primary lifts and their variations. ',
  },
  {
    header: 'Periodization (Linear, Alternating, Undulating)',
    info: 'Periodization is how your training is progressed over time, how does your intensity and  change over time. \n\nLinear Periodization is a simple, week to week overload of volume/intensity, whichever is appropriate for your current phase. \n\nAlternating Periodization employs a bit more fatigue management by alternating weekly between overloading the Squat and Bench or the Deadlift. \n\nUndulating Periodization is our most intricate scheme that rotates between Low, Medium and High sessions for each of the primary lifts, allowing for the most recovery between overloading sessions which is necessary for more advanced lifters or those with reduced recovery capacity, like Masters aged athletes.',
  },
  {
    header: 'Class',
    info: 'Your Class is a ranking of your strength relative to your weight class. These rankings are unique, as we found most federation’s classifications to be a bit outdated. This class helps us create appropriate training for you.',
  },
]
const scorePoints = [
  'Scores range from around 0 to ~30',
  "If you're consistently higher than 20 but feeling fatigued or lower than 12 and feeling great then you may not be honestly reporting your readiness questionnaire, RPEs, or end of session score",
  "If you're consistently at or lower than 15 then consider strategies to improve recovery",
  "If you're consistently at or higher than 20 after your second block (i.e. the system has re-calibrated your full lifter profile) then review your RPEs ratings and maxes as they may be too light. If you simply want easier workouts then stay as you are.",
  "If you're below 10 you are likely heavily fatigued and should consider taking a break from hard training. Switching to a bridge block is perfect for this.",
  'Your readiness decreasing through the weeks is expected but should return to around normal range towards the end of your deload and probably the first few days of your new block',
]
const readinessIntro = [
  'Your Readiness Rating is one of the most integral components to customizing your program.',
  'The Readiness Rating is based on research and development of a proprietary algorithm that takes into account your sleep, motivation, soreness, performance and more to help adjust your program at many levels including pre-training, intra-training, session to session, week to week, block to block and program to program. ',
  'It is critical that you are as forthright as possible when answering each questionnaire to help ensure that these ratings are as reflective as possible of you.',
]

const programOverviewIntro = [
  'Welcome to your  program! We cannot wait to help you reach your full potential and become stronger than ever.',
]

const trainingOverviewIntro = [
  'Welcome to the overview of your training day.',
  'Here can preview the estimated sets and intensity for each lift and estimated volume. Due to your level of readiness affecting these two factors these are only estimates.',
  'When you are ready to start your workout, tap the "Start Training" button to begin your session.',
  'To cycle between training days, simply go back to your dashboard and select the week/day you would like to view.',
]

const loadingStrategy = [
  {
    header: 'Top Set / Backoff Sets',
    info: 'Work up to a single heavy set for the day at an assigned RPE or weight and then perform the volume work for the day which is based on your performance in the top set. ',
  },
  {
    header: 'Straight Sets',
    info: 'This work is all done at a submaximal range for the given rep range, focus on quality and intent of movement.',
  },
  {
    header: 'Technique Sets',
    info: "Technique Sets are aimed to help you develop technical prowess at virtually no fatigue cost. Even though the weight will be very light, you need to utilize great mindfulness towards this work to feel every nuance of your technique. Treat this as deep practice, visualizing every rep as if it is a heavy attempt at a meet. Use a weight that allows you to feel technical errors. Going too light won't allow you to perceive errors, while too heavy can induce fatigue.",
  },
  {
    header: 'Accessory',
    info: 'The goal of accessory work is to build and complement your main movements. Reps in reserve (RIR) will guide your progress in these movements and remember that these are compliments to your main exercises so setting PRs in them should not be a high priority. ',
  },
  {
    header: 'Bridge Set',
    info: 'The focus of all Bridge Block training is quality of movement. When you are given a range, like 3-6 reps, only perform reps that you can move the bar powerfully and with great technique, if bar speed starts to slow down or technique falters, rack the bar and conclude that set. ',
  },
]

const warmupIntro = ['']

const generalTerms = [
  {
    header: 'Reading your graph',
    info: 'Your macro-cycle graph displays the different phases of training throughout your program. \n\nThe colored vertical bars indicate the level of volume (i.e. how much you will lift) you will have during each week. The dotted intensity line indicates the level of intensity (i.e. how heavy your weights will be) throughout the program. \n\nYou can cycle between squat, bench and deadlift to see the effect the varying periodization styles have on your intensity for that specific lift.',
  },
  {
    header: 'X Days Out',
    info: 'Days Out refers to how many days you away from your meet/test day.This is the day you test your true strength and perform a 1 rep max for your competition style Squat, Bench and Deadlift. The date of this can be found directly below your days out marker.',
  },
]
const phasesOverview = [
  {
    header: 'Hypertrophy',
    color: blockColors['block-color-hypertrophy'],
    info: 'Hypertrophy is a phase of training focused on building muscle. The main emphasis of this training will be increasing the total volume of training over time, hence the increasing number of sets from week to week. We will also utilize more exercise variation during this time to support higher volumes and avoid staleness. ',
  },
  {
    header: 'Strength',
    color: blockColors['block-color-strength'],
    info: 'Strength Blocks aim to increase the force production qualities of your muscular and nervous systems. To achieve this, we will look to overload intensity, increasing the weight on the bar over the course of the block.',
  },
  {
    header: 'Peaking',
    color: blockColors['block-color-peaking'],
    info: 'Peaking training is the final piece of preparation before a meet (or mock meet). The objectives of a Peaking Block are to: develop technical prowess, develop the physical/technical/neural/psychological skills of the 1 rep max and to manage the fitness/fatigue relationship.',
  },
  {
    header: 'Final Phase',
    color: blockColors['block-color-peaking'],
    info: 'The Final Phase is your last 1-3 weeks of training that has been specifically designed for you based on your lifter profile, meet date, taper style and training days per week. We have specified exactly which days we suggest you train. Do your best to stick to this plan.',
  },
  {
    header: 'Bridge',
    color: blockColors['block-color-bridge'],
    info: 'Bridge Blocks can serve an important role in successful long term training. The goal of a Bridge Block is to increase variety in the training to help you avoid adaptive resistance. This training will also improve your general work capacity through the short rest periods and relatively high frequency. Plus, the increase of variety and different training modalities are just plain fun and will provide a needed physical and mental break for typical powerlifting training. ',
  },

  {
    header: 'Deload',
    info: 'A Deload is a time of reduced intensity and volume to help manage fatigue. While the training during a Deload week can seem like it is too easy, it is an important part of staying healthy and being successful over the long term.',
  },
  {
    header: 'Taper',
    info: 'A Taper, similar to a deload, is a period of reduced intensity and volume but a Taper happens leading into a competition. The goals of a taper and to help you ensure your technique is at its best, while also decaying fatigue to help maximize your meet performance. The length of each taper is specifically created for every athlete based upon their gender, size, strength and training experience.',
  },
  {
    header: 'Preparatory',
    color: blockColors['block-color-inactive'],
    info: 'Preparatory training is used to help get you on the right schedule for your meet. For example, if you sign up on a Wednesday, some Preparatory work will be done until Sunday or Monday to ensure that you are feeling good and ready to start your program on time.',
  },
  {
    header: 'Transition',
    color: blockColors['block-color-inactive'],
    info: 'Transition Weeks serve a few purposes in your training. First, they create a smooth ramp up to higher volume training, giving your body time to acclimate, rather than just throwing you into the deep end. Second, they help your program line up to your meet properly in the event that the number of weeks until your competition needs some adjustment for proper phase length and structure. ',
  },
]

const rpe10Guide = [
  'Strategically selecting your 10 RPE (maximum effort) attempts is one of the most important aspects of ensuring success in your program.',
  'You should have a goal for your RPE 10 week at the start of your block and a more defined goal as you go into your RPE 10 week.',
  'You should use your current max as a tool to choose your RPE 10 weights based on projected maxes. For example if your 1rm in the squat is 350# and this week you have a RPE 10 test for 5 reps, you want to choose a weight that when done for 5, projects to a slightly higher max than 350 or if you have a previous 5rm PR, you want to aim to beat that.',
  'Use your warmup sets to gauge how you feel for the day, while you want to have a goal number in mind, you must be flexible based on how you feel for the day, you do not want to miss reps.',
  'For example, if your goal for the day is to do 315x5 at 10RPE, make your last warmup set 300x1 and use that set to gauge your readiness for the top set. Then when you begin your set with 315, after 1 or 2 reps, you should be able to tell if it is going to be less than 10RPE, if so, rack it and just call that another warmup set before moving your weights up. There is no reason to do 315x5 at 8RPE, fatiguing yourself, before you move up to attempt 325x5.',
]
const point = (info, index) => (
  <View key={index} style={{ flexDirection: 'row' }}>
    <Icon
      style={{ width: 10, height: 10, marginRight: 10, marginTop: 5 }}
      fill={'#FFF'}
      name='radio-button-off'
    />
    <View style={{ flexWrap: 'wrap', flexDirection: 'row', flex: 1 }}>
      <Text key={index} style={{ marginBottom: 5 }}>
        {info}
      </Text>
    </View>
  </View>
)

const introText = (info, index) => (
  <Text key={`intro${index}`} category='p1' style={{ marginBottom: 10 }}>
    {info}
  </Text>
)

const headerText = ({ header, info, color = '#FFF' }) => (
  <View key={header} style={{ marginBottom: 15 }}>
    <Text category='h6' style={{ color }}>
      {header}
    </Text>
    <Text>{info}</Text>
  </View>
)
const Readiness = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50 }}>
    {readinessIntro.map((info, index) => introText(info, index))}
    <Text category='h5' style={{ marginTop: 15 }}>
      Scores
    </Text>

    {scorePoints.map((info, index) => point(info, index))}
  </Layout>
)

const ProgramOverview = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50 }}>
    {programOverviewIntro.map((info, index) => introText(info, index))}
    <Text category='h5' style={{ marginTop: 15 }}>
      General Infomation
    </Text>
    {generalTerms.map(headerText)}

    <Text category='h5' style={{ marginTop: 15 }}>
      Phases of Training
    </Text>

    {phasesOverview.map(headerText)}
  </Layout>
)

const VolumeOverview = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50 }}>
    {programOverviewIntro.map((info, index) => introText(info, index))}
    <Text category='h5' style={{ marginTop: 15 }}>
      General Terms
    </Text>
    {volumeDataInfo.map(headerText)}
  </Layout>
)

const DecidingRPE10 = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50 }}>
    {rpe10Guide.map((info, index) => introText(info, index))}
  </Layout>
)

const RAS = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50, flexGrow: 1 }}>
    {rasInfo.map((info, index) => introText(info, index))}
  </Layout>
)

const MeetDay = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50, flexGrow: 1 }}>
    {meetDayInfo.map((info, index) => introText(info, index))}
    <Pressable onPress={() => Linking.openURL('')}>
      <Text status='primary' category='label'>
        Learn More
      </Text>
    </Pressable>
  </Layout>
)

const VideoSheet = ({ videoID }) => (
  <Layout level='2' style={{ flexGrow: 1 }}>
    <InlineVideo videoID={videoID} />
  </Layout>
)

const TrainingOverview = () => (
  <Layout level='2' style={{ padding: 20, paddingBottom: 50, flexGrow: 1 }}>
    {trainingOverviewIntro.map((info, index) => introText(info, index))}

    <Text category='h5' style={{ marginBottom: 5 }}>
      Loading Strategies
    </Text>
    {loadingStrategy.map(headerText)}
  </Layout>
)
const renderTab = () => (
  <View
    style={{
      width: 100,
      height: 6,
      borderRadius: 4,
      backgroundColor: '#CCC',
      marginBottom: 5,
      alignSelf: 'center',
    }}
  />
)

const infoSheetContent = (infoSheet) => {
  const { infoType, videoID } = infoSheet
  switch (infoType) {
    case 'readiness':
      return <Readiness />
    case 'overview':
      return <ProgramOverview />
    case 'volumeData':
      return <VolumeOverview />
    case 'rpe10':
      return <DecidingRPE10 />
    case 'RAS':
      return <RAS />
    case 'meetDay':
      return <MeetDay />
    case 'video':
      return <VideoSheet videoID={videoID} />
    case 'trainingOverview':
      return <TrainingOverview />
    default:
      return null
  }
}

const infoSheetHeaders = (infoSheet) => {
  const { infoType, title } = infoSheet

  if (title) {
    return title
  }
  switch (infoType) {
    case 'readiness':
      return 'Readiness'
    case 'overview':
      return 'Overview'
    case 'volumeData':
      return 'Your Program'
    case 'rpe10':
      return '10 RPE'
    case 'RAS':
      return 'Recovery Adaptive Strategies'
    case 'meetDay':
      return 'Meet Day'
    case 'trainingOverview':
      return 'Training Overview'
    case 'video':
      return ''
    default:
      return null
  }
}

export const InfoSheet = ({ fall }) => {
  const infoSheet = useTypedSelector((state) => state.infoSheet)

  const trans = new Value(0)
  const untraversedPos = new Value(0)
  const prevTrans = new Value(0)
  const headerPos = block([
    cond(
      lessThan(untraversedPos, sub(trans, 100)),
      set(untraversedPos, sub(trans, 100))
    ),
    cond(greaterThan(untraversedPos, trans), set(untraversedPos, trans)),
    set(prevTrans, trans),
    untraversedPos,
  ])
  const renderHeader = () => (
    <Layout level='3' style={{ padding: 15 }}>
      <Text category='h4'>{infoSheetHeaders(infoSheet)}</Text>
    </Layout>
  )

  const dispatch = useDispatch()
  const sheetRef = useRef(null)
  useEffect(() => {
    if (infoSheet.action === 'open_info_sheet') {
      sheetRef.current.snapTo(1)
    }
    if (infoSheet.action === 'close_info_sheet') {
      sheetRef.current.snapTo(0)
    }
  }, [infoSheet])

  const renderInner = () => (
    <Layout level='2' style={{ minHeight: 500 }}>
      <Animated.View
        style={{
          zIndex: 1,
          transform: [
            {
              translateY: headerPos,
            },
          ],
        }}>
        {renderHeader()}
      </Animated.View>

      {infoSheetContent(infoSheet)}
    </Layout>
  )

  const dimensions = useDimensions()
  const sheetMaxHeight =
    infoSheet.infoType === 'video' ? dimensions.window.width + 55 : 500

  return (
    <BottomSheet
      ref={sheetRef}
      enabledBottomClamp
      contentPosition={trans}
      snapPoints={[-1200, sheetMaxHeight]}
      renderHeader={renderTab}
      renderContent={renderInner}
      callbackNode={fall}
      onCloseEnd={() => dispatch({ type: 'CLOSE_INFO_SHEET' })}
    />
  )
}

const IMAGE_SIZE = 200

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  box: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
})
