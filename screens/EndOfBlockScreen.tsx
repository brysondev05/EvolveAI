import { useMemo, useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import {
  Layout,
  Button,
  Text,
  useTheme,
  Toggle,
  Divider,
  CheckBox,
  Input,
} from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'

import { endOfWeekCheckin } from '~/reduxStore/actions/powerlifting/cycleAdjustments/endOfWeekCheckinAction'
import { averages } from '~/helpers/Calculations'
import GradientHeader from '~/components/presentational/GradientHeader'
import { CommonActions } from '@react-navigation/native'
import { capitalizeFullString } from '~/helpers/Strings'
import { ButtonSwitch } from '~/components/presentational/buttons/ButtonSwitch'
import LayoutCard from '~/components/presentational/containers/LayoutCard'
import { useForm, Controller } from 'react-hook-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const firstModifier = (programModifiers) => {
  const { accessories, technique, trainingDays, weaknesses, pbFocuses } =
    programModifiers

  if (accessories) {
    return 'Accessories Modifications'
  }
  if (technique) {
    return 'Technique Modifications'
  }
  if (trainingDays) {
    return 'Training Days Modifications'
  }
  if (weaknesses) {
    return 'Weakness Modifications'
  }
  if (pbFocuses) {
    return 'Powerbuilding Modifications'
  }
}

// const powerbuildingValues = {
//   1: "1 - I feel fatigued and do not want to ramp up my training at all",
//   2: "2 - I feel ok and want to conservatively ramp up my training",
//   3: '3 - I feel good and want to moderately ramp up my training',
//   4: '4 - I feel great and want to ramp up my training',
//   5: '5 - I feel no fatigue at all and want to aggressively ramp up my training'
// }

const powerbuildingValues = [
  ['1', 'I feel fatigued and do not want to ramp up my training'],
  ['2', 'I feel ok and want to conservatively ramp up my training'],
  ['3', 'I feel good and want to moderately ramp up my training'],
  ['4', 'I feel great and want to ramp up my training'],
  [
    '5',
    'I feel no fatigue at all and want to aggressively ramp up my training',
  ],
]

const endofWeekHypValues = {
  1: '1 - Very tough, please make next week easier',
  2: '2 - The volume was tough but doable, I would like the system to be conservative in adding more sets next week based on my MEV/MRV.',
  3: '3 - The volume was tough but doable, I would like the system to be conservative in adding more sets next week based on my MEV/MRV.',
  4: '4 - The volume was moderate, I want the system to proceed as planned with my MEV/MRV adjustments.',
  5: '5 - The volume was easy, I would like to add as many sets as possible with my MEV/MRV limits.',
}
const endofWeekStrengthValues = {
  1: '1 - Very tough, please make next week easier',
  2: '2 - The volume was very tough, I would like the system to drop as many sets as possible in my MEV/MRV limits.',
  3: '3 - The volume was tough but doable, I would like the system to be aggressive in subtracting sets next week based on my MEV/MRV.',
  4: '4 -  The volume was moderate, I want the system to proceed as planned with my MEV/MRV adjustments.',
  5: '5 - The volume was easy, I would like to keep it the same next week even if weights get harder.',
}

const endOfWeekSheets = {
  1: '1 - The workouts very tough',
  2: '2 - The workouts could have been easier',
  3: '3 - The workouts felt just right',
  4: '4 - The workouts could have been tougher',
  5: '5 - The workouts were too easy',
}

const endOfWeekLifts = [
  ['1', 'The workouts very tough'],
  ['2', 'The workouts could have been easier'],
  ['3', 'The workouts felt good, proceed with my planned program'],
  ['4', 'The workouts could have been tougher'],
  ['5', 'The workouts were too easy'],
]

const AvgReadiness = ({ type }) => {
  if (type) {
    return (
      <Text category='s1' appearance='hint'>
        Avg. Readiness: {type}
      </Text>
    )
  }
  return null
}

const SBDSort = {
  squat: 0,
  bench: 1,
  deadlift: 2,
  upperPull: 3,
}

const quotes = [
  [
    'You can’t stop the waves but you can learn how to surf',
    'Jon Kabat-Zinn',
    'Training (and life) isn’t always going to go perfectly, but you can control how you react to those less than great days.',
  ],
  [
    'Worrying is stupid. It’s like walking around with an umbrella waiting for it to rain.',
    'Wiz Khalifa',
    'Using your energy to worry about your training or what your competition is doing isn’t going to bring about anything positive, just focus on what you can control.',
  ],
  [
    'Ask yourself: Where am I? Answer: Here. Ask yourself: What time is it? Answer: Now. Say it until you can hear it.',
    'Ram Dass',
    'Be where your feet are, don’t worry about the past because you can’t change or the future, just do what you can do well now.',
  ],
  [
    'The mind is just like a muscle—the more you exercise it, the stronger it gets and the more it can expand.',
    'Idowu Koyenikan',
    'Take some time today to visualize your success and build your mental muscle.',
  ],
  [
    'Don’t think your practice is right or wrong. Simply bring your whole heart to your practice',
    'Michael Stone',
    'Commit to the process, every rep, every exercise, every session, every day.',
  ],
  [
    'If you are conscious of “your” technique, it is not yet “your” technique',
    null,
    'In your next session, as the weight on the bar increases, let yourself just lift. Trust that the technique you’ve been working to develop will be there without having to think through every step.',
  ],
  [
    'Strength is Happiness. Strength is itself victory. In weakness there is no happiness. When you wage a struggle, you might win or you might lose. But regardless of the short-term outcome, the very fact of your continuing to struggle is proof of your victory.',
    'Daisuka Ikeda',
    null,
  ],
  [
    'To uncover your true potential, you must first find your own limits, and then you have to have the courage to blow past them',
    'Picabo Street',
    null,
  ],
  [
    'In victory or defeat, peace of mind can be found in a perfect effort',
    'Bob Ladocuer',
    null,
  ],
  [
    'Courage is resistance to fear, mastery of fear, not absence of fear.',
    'Mark Twain',
    null,
  ],
  [
    'Start where you are. Use what you have. Do what you can',
    'Arthur Ashe',
    'Maybe you wish you would have started training 5 years earlier, maybe you wish you had someone else’s genetics. Those wishes aren’t going to do anything for you though, do what you can today to get better.',
  ],
  [
    'I know that it seems like life is unfair right now, and you want things to be easier, but the rough side of the mountain will actually prepare you for life much better than the smooth side. Believe it or not, the setbacks of today can quickly become the forging blades of greatness for tomorrow. In fact, a wise man once said, “hardship often prepares ordinary people for an extraordinary destiny.',
    'Joshua Medcalf',
    null,
  ],
  ['Decide. Commit. Act. Succeed. Repeat', 'Tim S. Grover', null],
  ['Become Unstoppable', null, null],
  ['Grateful For Everything, Entitled To Nothing', null, null],
  ['Consistency Is King', null, null],
]

const cues = [
  [
    'The Why',
    'Think about WHY you are embarking on this journey. What’s your bigger reason aside from doing it for yourself? Write it down and reflect upon your WHY everyday.',
  ],
  [
    'Process Behaviors',
    'Pick a focus word or phrase this week to help you perform your best. The same way we warm up for our top sets in training, we need a mental warm-up as well. Write it down and be diligent about these “Process Behaviors”- they become habits. It is something you have control over and can perform regardless of how your day is going',
  ],
  [
    'Visualize Success',
    'Visualize successful lifts and clean technique. Vividly imagine each lift in the first person and be in the moment by bringing in all your senses-the butterflies you feel, the bar in your hands, the weight on your back etc. Over time the brain learns our routine movements, allowing these actions to become more automatic and fine-tuned. Pick a word or phase to think of when you want to remind yourself of these visualizations.\n',
  ],
  [
    'Positive Self-Talk',
    'We all have that one lift that we aren’t as confident in, but if you keep telling yourself things like “poverty bench” it will always remain your nemesis. Write down the lift that you are the most confident in performing and what you’re thinking while you are doing it.  How can you apply this same mindset to the lifts that give you trouble?',
  ],
  [
    'Stay In The Moment',
    'We all fail lifts from time to time, but it’s important to recognize that one bad lift or day doesn’t dictate the next. What helps you stay in the moment or gets you out of a funk? Remember your WHY and write down three reasons why you started.',
  ],
  [
    'Rise To The Occasion',
    'We all fail and face challenges, but those challenges are also what makes us great. What are some challenges you’ve faced so far and how can they make you better?',
  ],
  [
    'Arousal Control',
    'It’s  important to learn how to get the confidence up before a big lift, but it’s equally as important not to get so fired up in training that you can’t harness that high arousal when you need it most-like during a competition. This week focus on getting in the optimal training “zone” which is a happy medium between the high and low arousal. Write down the best technique(s) that helps calm your nerves as well as those that fire you up.',
  ],
  [
    'Honor the process',
    'Every training block will consist of peaks and valleys and it’s important to recognize that both the ups and downs are normal; progress isn’t linear. Reflect on how far you’ve come-even if it feels like you’re currently in a valley.',
  ],
  [
    'Pre-Performance Routines ',
    'Having a routine will help you block out distractions, focus on the task at hand, and stay in the moment. Doing things like hitting your chest on the bar before you squat, or breathing deeply and shouting go time before every lift- whatever your routine is commit to it regardless of the circumstances. This week write down your routine for each lift and visualize each step on your off days. ',
  ],
  [
    'Controlling Anxiety ',
    "Anxiety is normal and usually based around the fear of failing. Let those feelings work for you and not agianst you by: Expecting It-if you've been visualizing your lifts and using all your senses you know there will be butterflies, Breath-If you're feeling panicky slow your breathing and take in deep controlled breaths, Avoid Stimulants-too much caffeine can work against you. Reframe your thoughts around what you are feeling, write down those key words or pharses that help you stay in the now and flip the switch.",
  ],
  [
    'Strong Body Language ',
    "Powerful body language can send signals to the brain that you're more confident. Sitting up straight and keeping your chin high versus slumping and looking defeated will help you fend off any negative self talk and unproductive thinking patterns that can impact you psychologically. What's your body langiage that makes you feel most powerful? ",
  ],
  [
    'Smile',
    "Research has shown smiling spurs a chemical reaction in the brain releasing edorphins.  Even if it's a forced smile, your body and mind are intertwined and feelings of positivity carry over into how we percieve things. If you're having a bad training day, think about what makes you smile,write it down, and turn the session around. ",
  ],
  [
    "Feel Don't Think",
    'As you approach the higher percentage ranges in your lifts you need to let your body do what’s its been trained to do and stop overthinking. Write down one cue for each lift, make it one word, and that’ll will be the only cue you think about for those top sets.',
  ],
  [
    'Verbalize It',
    'Say it loud! There is so much power when you verbilize somthing. Saying it out loud activates the brain into action mode. Write down the word or words that drive you to action and then say it out loud. ',
  ],
  [
    'Control The Controllables',
    ' Life will always throw curveballs and you cannot control everything. If you get sick or can’t train for\na week all is not lost, there is always something that is in your control. If you’re facing or have faced uncertain circumstances write it down and then write down the things that are/were in your control.',
  ],
  [
    'Confidence',
    'If you want to be successful you have to be confident in your abilities. Focus words and cues won’t have the same impact if you don’t first believe you can do it. The more you practice the lifts the better you’ll become at their execution and with that comes more confidence. As you approach this week look back at your training log-write down how many sets and reps you’ve already done and be CONFIDENT. ',
  ],
  [
    'Stay Grateful',
    "If you're dealing with injury or feeling that you've taken a step back in a lift it's easy to get dicouraged and feel defeated.  It's normal to feel angry or sad if your body won't do what it did before. Staying gratefrul for what you are able to do is a great way to pivot your mindset.  Write down all the things your body is doing for you today that you are grateful for.",
  ],
  [
    'Expectations ',
    "Strength is not linear. It would be great if every block meant PR's, but that's just not the reality.  If you're coming off an injury/sickness/layoff adjusting your expectations early on will prevent a lot of frustration and comparison to your old numbers.  What are realistic goals,things like lift pain free, be consistent, you can set to walk away with a \"win\"? ",
  ],
]
export const EndOfBlockScreen = ({ navigation, route }) => {
  const { week, blockType, blockVolume, cycleID } = route.params

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )
  const currentWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks && data.programWeeks?.[`week${week}`]
  )

  const nextWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks && data.programWeeks?.[`week${week + 1}`]
  )

  const allAverages = useMemo(() => {
    if (currentWeek) {
      return {
        squat: averages(
          currentWeek.readinessScores?.map((score) => score?.squat)
        ),
        bench: averages(
          currentWeek.readinessScores?.map((score) => score?.bench)
        ),
        deadlift: averages(
          currentWeek.readinessScores?.map((score) => score?.deadlift)
        ),
        upperPull:
          programIndex === 1
            ? averages(
                currentWeek.readinessScores?.map((score) => score?.upperPull)
              )
            : null,
      }
    }
    return null
  }, [currentWeek])

  const mainLifts = ['squat', 'bench', 'deadlift', 'upperPull']
  const accessories = [
    'abs',
    'back',
    'biceps',
    'chest',
    'shoulders',
    'triceps',
    'calves',
    'glutes',
    'hamstrings',
    'quads',
  ]
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mindset: '',
      mainLifts: {
        squat: 3,
        bench: 3,
        deadlift: 3,
        upperPull: 3,
      },
      accessories: {
        abs: 3,
        back: 3,
        biceps: 3,
        chest: 3,
        shoulders: 3,
        triceps: 3,
        calves: 3,
        glutes: 3,
        hamstrings: 3,
        quads: 3,
      },
      modifyProgram: false,
      programModifiers: {
        trainingDays: false,
        weaknesses: false,
        technique: false,
        accessories: false,
        pbFocuses: false,
        program: false,
      },
    },
  })

  const modifyProgram = watch('modifyProgram')

  const dispatch = useDispatch()

  const programIndex =
    userProgram?.programDetails?.userProgramData?.programIndex

  const handleNavigateToProgramModifiers = ({
    programModifiers,
    mainLifts,
    accessories,
    mindset,
  }) => {
    const values =
      programModifiers && Object.values(programModifiers).filter((item) => item)

    if (values?.length > 0) {
      dispatch({
        type: 'END_OF_WEEK_MODIFICATION',
        week,
        blockType,
        blockVolume,
        mainLiftsReport: mainLifts,
        cycleID,
        programModifiers,
        accessoriesReport: accessories,
        mindset,
      })
      navigation.navigate('Modify your program', {
        screen: firstModifier(programModifiers),
      })
    }
    return false
  }

  useEffect(() => {
    if (
      nextWeek &&
      nextWeek?.blockType[0] === 'P' &&
      currentWeek?.blockType[0] !== 'P'
    ) {
      Alert.alert(
        'Peaking Starts Next Week!',
        'Next week is the start of your final block. As we want you to have the most effective training plan, this will be the last chance you get to change your training days. We suggest picking the amount of days you know you can commit to.',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      )
    }
  }, [nextWeek])

  const submitWeek = async ({
    programModifiers,
    mainLifts,
    accessories,
    mindset,
  }) => {
    await dispatch({
      type: 'END_OF_WEEK_MODIFICATION',
      week,
      blockType,
      blockVolume,
      accessoriesReport: accessories,
      mainLiftsReport: mainLifts,
      cycleID,
      programModifiers,
      mindset,
    })

    dispatch(endOfWeekCheckin({ withProgramModifications: false }))
  }

  const quoteNum = Math.floor(Math.random() * quotes.length)

  const quote = quotes[quoteNum]

  const cueNum = Math.floor(Math.random() * cues.length)

  const cue = cues[cueNum]
  return (
    <Layout style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <GradientHeader
          title={`End of week`}
          subheading="How did your week go? Let's checkin with how you're feeling."
        />
        <View
          style={{
            paddingVertical: 20,
            marginBottom: 30,
            paddingHorizontal: 15,
          }}>
          <Controller
            control={control}
            name='mindset'
            render={({ field: { onChange, onBlur, value } }) => (
              <LayoutCard level='2'>
                <Text category='h4'>Weekly Mindset</Text>

                <Text
                  category='s1'
                  style={{ marginTop: 5, fontSize: 18, textAlign: 'center' }}
                  status='primary'>
                  "{quote[0]}"
                </Text>
                <Text
                  category='label'
                  appearance='hint'
                  style={{ fontSize: 14, textAlign: 'center' }}>
                  {quote[1]}
                </Text>
                <Text style={{ marginTop: 10 }}>{quote[2]}</Text>

                <Text category='label' style={{ marginTop: 15 }}>
                  {cue[0]}
                </Text>
                <Text appearance='hint'>{cue[1]}</Text>
                <Input
                  returnKeyType='done'
                  multiline
                  blurOnSubmit
                  status='primary'
                  onChangeText={onChange}
                  value={value}
                  style={{ marginVertical: 15 }}
                  textStyle={{ minHeight: 60 }}
                  placeholder='My mindset for next week...'
                />
              </LayoutCard>
            )}
          />

          <Layout
            level='2'
            style={{
              marginTop: 15,
              paddingTop: 15,
              paddingHorizontal: 15,
              marginBottom: 15,
              borderRadius: 14,
            }}>
            <Text category='h4'>Program Volume</Text>
            <Text>
              Let us know how you found the overall volume of the week below so
              the AI can make adjustments for your next week.
            </Text>
            <Divider style={{ marginVertical: 10 }} />
            <Text category='h6' style={{ marginBottom: 5 }}>
              Main Lifts
            </Text>

            {mainLifts.map((movement) => {
              if (
                movement === 'upperPull' &&
                (['B', 'R'].includes(blockType[0]) || programIndex === 0)
              ) {
                return
              }
              return (
                <Controller
                  key={movement}
                  control={control}
                  name={`mainLifts.${movement}`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View key={movement} style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text category='s1' style={{ marginBottom: 15 }}>
                          {capitalizeFullString(movement)}
                        </Text>
                        {/* <Text category='s1' appearance='hint'>
                          {allAverages?.[movement] &&
                            `Average: ${allAverages?.[movement]}`}
                        </Text> */}
                      </View>
                      <ButtonSwitch
                        style={{ flex: 1 }}
                        onSelect={(index) => onChange(index + 1)}
                        selectedIndex={value - 1}>
                        {endOfWeekLifts.map((butt, index) => (
                          <Button
                            key={index}
                            status={index === value - 1 ? 'primary' : 'primary'}
                            size='small'
                            style={{ flex: 1 }}>
                            {butt[0]}
                          </Button>
                        ))}
                      </ButtonSwitch>
                      <Text
                        category='c1'
                        style={{ marginVertical: 10, paddingRight: '5%' }}>
                        {endOfWeekLifts[value - 1]?.[1]}
                      </Text>
                      <Divider style={{ marginVertical: 10 }} />
                    </View>
                  )}
                />
              )
            })}
          </Layout>
          {programIndex === 1 && !['B', 'R'].includes(blockType[0]) && (
            <Layout level='4' style={{ padding: 15, borderRadius: 14 }}>
              <Text category='h4' style={{ marginBottom: 5 }}>
                Accessories
              </Text>

              {accessories.map((movement) => {
                return (
                  <Controller
                    control={control}
                    name={`accessories.${movement}`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View key={movement} style={{ flex: 1 }}>
                        <Text category='s1' style={{ marginBottom: 15 }}>
                          {capitalizeFullString(movement)}
                        </Text>
                        <ButtonSwitch
                          style={{ flex: 1 }}
                          onSelect={(index) => onChange(index + 1)}
                          selectedIndex={value - 1}>
                          {powerbuildingValues.map((butt, index) => (
                            <Button
                              key={index}
                              status={
                                index === value - 1 ? 'primary' : 'primary'
                              }
                              size='small'
                              style={{ flex: 1 }}>
                              {butt[0]}
                            </Button>
                          ))}
                        </ButtonSwitch>
                        <Text
                          category='c1'
                          style={{ marginVertical: 10, paddingRight: '5%' }}>
                          {powerbuildingValues[value - 1]?.[1]}
                        </Text>
                        {movement !== 'quads' && (
                          <Divider style={{ marginVertical: 10 }} />
                        )}
                      </View>
                    )}
                  />
                )
              })}
            </Layout>
          )}
          <View style={{ alignItems: 'flex-start', paddingHorizontal: 15 }}>
            <Controller
              control={control}
              name='modifyProgram'
              render={({ field: { onChange, onBlur, value } }) => (
                <Toggle
                  status='control'
                  style={{ marginVertical: 20 }}
                  checked={value}
                  onChange={onChange}>
                  Modify Program?
                  {'\n'}
                  {programIndex === 1
                    ? 'Select this if you would like to change your weaknesses, lifting styles or training days'
                    : 'Select this if you would like to change your lifting styles, training days or focuses'}
                </Toggle>
              )}
            />
            {modifyProgram && (
              <Layout
                level='3'
                style={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 14,
                  padding: 20,
                }}>
                <Text category='h4'>Modify Program</Text>
                <Text
                  category='label'
                  style={{ marginBottom: 15, marginTop: 5 }}
                  status='danger'>
                  Warning:{' '}
                  <Text>
                    We do not recommend changing these settings until after a
                    deload week. Changing these settings will reset your
                    selected exercises for any future weeks.
                  </Text>
                </Text>
                {/* <CheckBox
    checked={programModifiers.accessories}
    onChange={nextChecked => setProgramModifier(prev => {
      return {...prev, accessories: nextChecked}})}>
    Accessories
  </CheckBox> */}
                {/* <CheckBox
  disabled
  style={styles.modifierCheckbox}
                  checked={programModifiers.program}
                  onChange={nextChecked => setProgramModifier(prev => {
                    return { ...prev, program: nextChecked }
                  })}>
                  Switch To Powerlifting
  </CheckBox> */}
                <Controller
                  control={control}
                  name='programModifiers.technique'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CheckBox
                      style={styles.modifierCheckbox}
                      checked={value}
                      onChange={onChange}>
                      Competition Lifting Styles
                    </CheckBox>
                  )}
                />

                <Controller
                  control={control}
                  name='programModifiers.trainingDays'
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CheckBox
                      disabled={currentWeek?.blockType[0] === 'P'}
                      style={styles.modifierCheckbox}
                      checked={value}
                      onChange={onChange}>
                      Training Days
                    </CheckBox>
                  )}
                />

                {programIndex === 1 ? (
                  <Controller
                    control={control}
                    name='programModifiers.pbFocuses'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CheckBox
                        style={styles.modifierCheckbox}
                        checked={value}
                        onChange={onChange}>
                        Powerbuilding Ratios & Focuses
                      </CheckBox>
                    )}
                  />
                ) : (
                  <Controller
                    control={control}
                    name='programModifiers.weaknesses'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CheckBox
                        style={styles.modifierCheckbox}
                        checked={value}
                        onChange={onChange}>
                        Weaknesses
                      </CheckBox>
                    )}
                  />
                )}
              </Layout>
            )}
          </View>
          <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
            {!modifyProgram ? (
              <Button
                appearance='outline'
                status='success'
                onPress={handleSubmit(submitWeek)}>
                Complete Week
              </Button>
            ) : (
              <Button
                appearance='outline'
                status='warning'
                onPress={handleSubmit(handleNavigateToProgramModifiers)}>
                Modify Program
              </Button>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  modifierCheckbox: {
    marginVertical: 5,
  },
})
