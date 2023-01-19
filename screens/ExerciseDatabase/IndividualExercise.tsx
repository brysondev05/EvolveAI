import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  Alert,
  Dimensions,
} from 'react-native'
import {
  Layout,
  Text,
  Button,
  Divider,
  Icon,
  useTheme,
  Toggle,
} from '@ui-kitten/components'
import {
  useFirestore,
  useFirestoreConnect,
  isEmpty,
  isLoaded,
} from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import { ScrollView } from 'react-native-gesture-handler'
import { useExerciseChange } from '~/hooks/workout/useExerciseChange'
import { Video } from 'expo-av'

import { useWindowDimensions } from 'react-native'
import VideoHeader from '~/components/presentational/VideoHeader'
import { exerciseData } from '~/assets/data/exerciseData'
import { pillars } from '~/assets/data/pillarsOfMovement'
import { capitalizeFullString } from '~/helpers/Strings'

import { useDispatch } from 'react-redux'
import { ButtonSwitch } from '~/components/presentational/buttons/ButtonSwitch'
import { handleError } from '~/errorReporting'
import NetInfo from '@react-native-community/netinfo'
import { dateToDate } from '~/helpers/Dates'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'
import { useHeaderHeight } from '@react-navigation/elements'
import YoutubePlayer from 'react-native-youtube-iframe'
import WebView from 'react-native-webview'
const { width, height } = Dimensions.get('window')
const repTypes = [
  { display: 'Low', code: 'LR' },
  { display: 'Med', code: 'MR' },
  { display: 'High', code: 'HR' },
]
const unitTypes = ['LB', 'KG']
const weightIncrements = [0.25, 1, 2.5, 5, 10]
const exerciseTypes = ['Reps', 'Timed']

const benchmarkText = ({
  first,
  second,
}: {
  first: string | null
  second: string | null
}) => {
  if (!first) {
    return 'Not set'
  }

  if (second) {
    return `${first} | ${second}`
  }

  return first
}

const PillarLink = ({ url, title, description }, index) => (
  <View key={index} style={{ marginVertical: 15 }}>
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={() => Linking.openURL(url)}>
      <Text category='h6'>{title}</Text>
      <Icon
        name='link-outline'
        fill='white'
        style={{ width: 20, height: 20, marginLeft: 5, marginTop: 2 }}
      />
    </Pressable>
    <Text category='p2'>{description}</Text>
  </View>
)

const Pillar = ({ movement }) => {
  const { shortCode, pillars, title, description } = movement

  if (!title && !description) {
    return null
  }

  return (
    <View key={shortCode} style={{ paddingHorizontal: 15 }}>
      <Divider style={{ marginBottom: 15 }} />
      <Text category='h4'>{title}</Text>
      <Text category='p2'>{description}</Text>
      {pillars.map(PillarLink)}
    </View>
  )
}

const PillarsSection = ({ exerciseShortcode, deadliftStyle }) => {
  if (
    ['BN0', 'SQ0', 'DL111'].includes(exerciseShortcode) ||
    (exerciseShortcode === 'DL0' && deadliftStyle === 0)
  ) {
    return <Pillar movement={pillars[exerciseShortcode]} />
  }

  if (exerciseShortcode === 'DL0' && deadliftStyle === 1) {
    return <Pillar movement={pillars['DL111']} />
  }

  return null
}

export default function IndividualExercise({ navigation, route }) {
  const { exerciseID, isExerciseSwap } = route.params
  const userID = useTypedSelector((state) => state.firebase.auth.uid)

  const programDetails = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram?.programDetails
  )
  const userLifterProfile = programDetails?.userLiftingData
  const userBioData = programDetails?.userBioData

  const exercisePath = `users/${userID}/exercises`

  useFirestoreConnect([
    {
      collection: `users/${userID}/exercises`,
      doc: exerciseID,
      storeAs: exerciseID,
    },
  ])

  const firestore = useFirestore()

  const exercise = useTypedSelector(
    ({ firestore: { data } }) => data[exerciseID]
  )
  useEffect(() => {
    if (isLoaded(exercise) && isEmpty(exercise) && userBioData) {
      try {
        console.log('exercise not found')

        const newExercise = exerciseData.find(
          (exercise) => exercise.exerciseShortcode === exerciseID
        )
        if (newExercise) {
          const {
            coachingCues,
            videoID,
            description,
            isAccessory,
            isPerSide,
            ...rest
          } = newExercise

          firestore
            .collection(`users/${userID}/exercises`)
            .doc(exerciseID)
            .set(
              { ...rest, units: userBioData?.unitsIndex === 1 ? 'kg' : 'lb' },
              { merge: true }
            )
        }
      } catch (e) {
        handleError(e)
        dispatch(
          showErrorNotification({
            title: 'Error',
            description: 'Unable to find exercise.',
          })
        )
      }
    }
  }, [exercise, userBioData])
  const handleExerciseChange = useExerciseChange({
    shortCode: exercise?.exerciseShortcode,
    navigation,
  })

  const windowWidth = useWindowDimensions().width

  const exerciseInfo = exerciseData.find(
    (item) => item.exerciseShortcode === exercise?.exerciseShortcode
  )

  const isUserExercise = exercise?.exerciseShortcode?.[0] === '_'

  const theme = useTheme()
  const [repType, setRepType] = useState(2)
  const [unitType, setUnitType] = useState(0)
  const [exerciseType, setExerciseType] = useState(0)
  const [weightIncrement, setWeightIncrement] = useState(1)
  const [benchmarkEnabled, setBenchmarkEnabled] = useState(false)
  const [benchmark, setBenchmark] = useState(null)

  const dispatch = useDispatch()
  const headerHeight = useHeaderHeight()

  const videoRef = useRef()
  const updateRepType = useCallback(
    (index) => {
      setRepType(index)
      const repTypeCode = repTypes[index].code
      return firestore
        .collection(exercisePath)
        .doc(exercise.exerciseShortcode)
        .update({ repType: repTypeCode })
    },
    [exercisePath, exercise]
  )
  const updateUnitType = useCallback(
    (index) => {
      setUnitType(index)
      return firestore
        .collection(exercisePath)
        .doc(exercise.exerciseShortcode)
        .update({ units: unitTypes[index].toLowerCase() })
    },
    [exercisePath, exercise]
  )

  const updateIncrement = useCallback(
    (index) => {
      setWeightIncrement(index)
      return firestore
        .collection(exercisePath)
        .doc(exercise.exerciseShortcode)
        .update({ weightIncrement: weightIncrements[index] })
    },
    [exercisePath, exercise]
  )

  const updateExerciseType = useCallback(
    (index) => {
      setExerciseType(index)
      return firestore
        .collection(exercisePath)
        .doc(exercise.exerciseShortcode)
        .update({
          style: exerciseTypes[index] === 'Timed' ? 'TUT' : 'Periodization',
        })
    },
    [exercisePath, exercise]
  )

  const updateBenchmarkEnabled = useCallback(
    (value: boolean) => {
      const defaultBenchmark = exerciseInfo.benchmark

      const disabledBenchmark = {
        hypertrophy: {
          first: null,
          second: null,
        },
        strength: {
          first: null,
          second: null,
        },
      }

      const benchmarkValue = value ? defaultBenchmark : disabledBenchmark

      setBenchmarkEnabled(value)
      setBenchmark(benchmarkValue)

      return firestore
        .collection(exercisePath)
        .doc(exercise.exerciseShortcode)
        .update({ benchmark: benchmarkValue })
    },
    [exercisePath, exercise, exerciseInfo]
  )

  const handleDeleteExercise = async () => {
    await firestore.doc(`users/${userID}/exercises/${exerciseID}`).delete()
    navigation.goBack()
  }

  useEffect(() => {
    if (isLoaded(exercise) && !isEmpty(exercise)) {
      if (exercise.repType && repType !== exercise.repType) {
        const repType = repTypes.find((type) => type.code == exercise.repType)
        setRepType(repTypes.indexOf(repType))
      }
      if (
        exercise.units &&
        unitType !== unitTypes.indexOf(exercise.units.toUpperCase())
      ) {
        setUnitType(unitTypes.indexOf(exercise.units.toUpperCase()))
      }
      if (
        exercise.weightIncrement &&
        weightIncrement !== weightIncrements.indexOf(exercise.weightIncrement)
      ) {
        setWeightIncrement(weightIncrements.indexOf(exercise.weightIncrement))
      }
      if (!exercise.weightIncrement) {
        setWeightIncrement(exercise?.units?.toLowerCase() === 'lb' ? 3 : 2)
      }
      if (exercise.benchmark) {
        setBenchmark(exercise.benchmark)
        setBenchmarkEnabled(
          exercise.benchmark.hypertrophy.first != null ||
            exercise.benchmark.strength.first != null
        )
      }
      if (isUserExercise) {
        setExerciseType(exercise?.style === 'TUT' ? 1 : 0)
      }
    }
  }, [exercise])

  const exerciseMax = exercise?.max?.amount
    ? `${exercise.max.amount}${exercise?.max?.units}`
    : 'Enter 1RM'

  const tenBands = useCallback(() => {
    if (exercise?.rm10?.bands) {
      const bandNames = Object.entries(exercise?.rm10?.bands)
        .reduce((acc, [key, val]) => {
          if (val > 0) {
            acc.push(`${key} x${val}`)
          }
          return acc
        }, [])
        .join(', ')

      return (
        bandNames.length > 0 && (
          <Text category='s1' appearance='hint' style={{ flex: 1 }}>
            {'\n'}+ Bands {'\n'}({bandNames})
          </Text>
        )
      )
    }
    return null
  }, [exercise?.rm10])

  const tenRepMax = exercise?.rm10?.usingBodyweight
    ? 'Bodyweight'
    : exercise?.rm10 && exercise?.rm10?.amount !== null
    ? `${exercise?.rm10?.amount}${exercise?.rm10?.units} `
    : 'Enter 10RM'

  const lastSet = exercise?.lastSet

  const [playVideo, setPlayVideo] = useState(true)

  const [connectionType, setConnectionType] = useState(null)

  useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnectionType(state.type)
      if (state.type === 'cellular') {
        setPlayVideo(false)
      }
    })

    // Unsubscribe
    unsubscribe()
  }, [])
  const videoID = () => {
    // if (exerciseInfo?.exerciseShortcode === 'DL0') {
    //   if (userLifterProfile?.deadlift.style === 0) {
    //     return 'DATA_HERE'
    //   } else {
    //     return 'DATA_HERE'
    //   }
    // }
    console.log(exerciseInfo.videoID)
    if (exerciseInfo?.videoID) {
      return exerciseInfo.videoID
    }

    return null
  }

  const [playing, setPlaying] = useState(true)
  const onStateChange = useCallback((state) => {
    //console.log(state);
    if (state === 'ended') {
      setPlaying(false)
      //Alert.alert("video has finished playing!");
    }
  }, [])

  const exerciseDetails = isLoaded(exercise) && !isEmpty(exercise) && (
    <>
      {!exercise.isUserExercise && videoID() ? (
        // <View
        //   style={{
        //     alignItems: 'flex-start',
        //     justifyContent: 'flex-end',
        //     marginBottom: 20,
        //     position: 'relative',
        //     flex: 1,
        //     minHeight: windowWidth,
        //     paddingLeft: 20,
        //     marginTop: headerHeight,
        //   }}>

        //   <Video
        //     source={{
        //       uri: `https://videodelivery.net/${videoID()}${
        //         Platform.OS === 'ios' ? '.mp4' : '.mp4'
        //       }`,
        //     }} // Can be a URL or a local file.
        //     style={styles.backgroundVideo}
        //     resizeMode='cover'
        //     ref={videoRef}
        //     isLooping
        //     usePoster
        //     isMuted
        //     shouldPlay={playVideo}
        //     posterSource={{
        //       uri: `https://videodelivery.net/${videoID}/thumbnails/thumbnail.jpg?width=500&height=500`,
        //     }}
        //   />

        //   <VideoHeader
        //     title={exerciseInfo.exerciseName}
        //     filled
        //     playVideo={playVideo}
        //     setPlayVideo={setPlayVideo}
        //     connectionType={connectionType}
        //   />
        // </View>
        //Youtube Player iFrame Library is used to play the exercise video for each exercise.
        //Video Id: Every id is different for each exercise and passed in exercise database.
        <View
          style={{
            marginBottom: 20,
            paddingHorizontal: 10,
            position: 'relative',
            marginTop: headerHeight,
          }}>
          <View>
            <YoutubePlayer
              height={width * 0.57 + 50} //based on the youtube aspect ratio
              play={playing} //based on weather it's playing or not
              videoId={videoID()}
              webViewProps={{
                androidLayerType: 'hardware',
              }}
              onChangeState={onStateChange}
              mute={true} // to mute the video
              initialPlayerParams={{controls: false, modestbranding: true}} //to remove the youtube logo & basic youtube control.
            />
          </View>
          <Text category='h6'>{exerciseInfo.exerciseName}</Text>
          {/* <VideoHeader
            title={exerciseInfo.exerciseName}
            filled
            playVideo={true}
            setPlayVideo={() => {
              setPlaying(true);
            }}
            connectionType={connectionType}
          /> */}
        </View>
      ) : (
        <View style={{ paddingTop: 100, paddingHorizontal: 15 }}>
          {exercise.isUserExercise && (
            <Text category='s1' status='primary'>
              My Exercise
            </Text>
          )}
          <Text category='h3'>{exercise.exerciseName}</Text>
        </View>
      )}
    </>
  )

  const benchmarkSettings =
    isLoaded(exercise) &&
    !isEmpty(exercise) &&
    exerciseInfo?.benchmark != null ? ( // use local exercise info to check whether benchmark sets are available for this lift
      <>
        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.exerciseRow}>
          <Text category='h6'>Benchmark</Text>

          <Toggle
            status='control'
            checked={benchmarkEnabled}
            onChange={updateBenchmarkEnabled}
          />
        </View>

        {benchmarkEnabled ? (
          <>
            <View style={styles.exerciseRow}>
              <Text category='label'>Hypertrophy</Text>

              <Pressable
                onPress={() =>
                  navigation.navigate('Benchmark', {
                    exerciseID,
                    exerciseName: exerciseInfo.exerciseName,
                    block: 'hypertrophy',
                    previousBenchmark: benchmark?.hypertrophy ?? {},
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text category='s1' appearance='hint'>
                  {benchmarkText(benchmark?.hypertrophy ?? {})}
                </Text>
                <Icon
                  name='edit-outline'
                  fill={theme['text-hint-color']}
                  style={{ width: 18, height: 18, marginLeft: 8 }}
                />
              </Pressable>
            </View>
            <View style={styles.exerciseRow}>
              <Text category='label'>Strength</Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('Benchmark', {
                    exerciseID,
                    exerciseName: exerciseInfo.exerciseName,
                    block: 'strength',
                    previousBenchmark: benchmark?.strength ?? {},
                  })
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text category='s1' appearance='hint'>
                  {benchmarkText(benchmark?.strength ?? {})}
                </Text>
                <Icon
                  name='edit-outline'
                  fill={theme['text-hint-color']}
                  style={{ width: 18, height: 18, marginLeft: 8 }}
                />
              </Pressable>
            </View>
          </>
        ) : null}
      </>
    ) : null

  const exerciseSettings = isLoaded(exercise) && !isEmpty(exercise) && (
    <View style={{ paddingHorizontal: 20 }}>
      {__DEV__ && <Text>Shortcode: {exercise.exerciseShortcode}</Text>}

      <View style={styles.exerciseRow}>
        <Text category='label'>Preferred Rep Style</Text>
        <ButtonSwitch onSelect={updateRepType} selectedIndex={repType}>
          {repTypes.map((inc) => (
            <Button key={inc.code} size='small'>
              {inc.display}
            </Button>
          ))}
        </ButtonSwitch>
      </View>

      {isUserExercise && (
        <View style={styles.exerciseRow}>
          <Text category='label'>Exercise Style</Text>
          <ButtonSwitch
            onSelect={updateExerciseType}
            selectedIndex={exerciseType}>
            {exerciseTypes.map((inc) => (
              <Button key={inc} size='small'>
                {inc}
              </Button>
            ))}
          </ButtonSwitch>
        </View>
      )}

      <View style={styles.exerciseRow}>
        <Text category='label'>Units</Text>
        <ButtonSwitch onSelect={updateUnitType} selectedIndex={unitType}>
          {unitTypes.map((inc) => (
            <Button key={inc} size='small'>
              {inc}
            </Button>
          ))}
        </ButtonSwitch>
      </View>

      <View
        style={[
          styles.exerciseRow,
          {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
          },
        ]}>
        <Text category='label' style={{}}>
          Weight Increments
        </Text>
        <ButtonSwitch
          style={{ alignSelf: 'flex-end', flex: 1, marginTop: 5 }}
          onSelect={updateIncrement}
          selectedIndex={weightIncrement}>
          {weightIncrements.map((inc) => (
            <Button key={inc} size='small'>
              {inc}
            </Button>
          ))}
        </ButtonSwitch>
      </View>

      {benchmarkSettings}

      <Divider style={{ marginVertical: 20 }} />

      <View style={styles.exerciseRow}>
        <Text category='label'>1 Rep Max</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('RecordMax', {
              exerciseID,
              initialUnits: exercise?.max?.amount
                ? exercise?.max?.units
                : exercise?.units,
              type: '1RM',
              previousMax: exercise?.max?.amount,
            })
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text category='s1' appearance='hint'>
            {exerciseMax}
          </Text>
          <Icon
            name='edit-outline'
            fill={theme['text-hint-color']}
            style={{ width: 18, height: 18, marginLeft: 8 }}
          />
        </Pressable>
      </View>
      <View style={[styles.exerciseRow, { alignItems: 'flex-start' }]}>
        <Text category='label'>10 Rep Max</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('RecordMax', {
              exerciseID,
              initialUnits: exercise?.units,
              type: '10RM',
              previousMax: exercise?.rm10?.max,
            })
          }
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={{ textAlign: 'right' }} category='s1' appearance='hint'>
            {tenRepMax} {tenBands()}
          </Text>
          <Icon
            name='edit-outline'
            fill={theme['text-hint-color']}
            style={{ width: 18, height: 18, marginLeft: 8 }}
          />
        </Pressable>
      </View>

      {lastSet && (
        <View style={styles.exerciseRow}>
          <Text category='label'>Last Set</Text>

          <View style={{}}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                category='s1'
                style={{ paddingRight: 5 }}>{`${capitalizeFullString(
                lastSet.type
              )} Set`}</Text>
              <Text category='s1' style={{ paddingLeft: 5 }}>
                {dateToDate(lastSet?.date)?.toLocaleDateString()}
              </Text>
            </View>

            <Text category='s1' appearance='hint'>{`${lastSet.amount}${
              lastSet.units
            } x ${lastSet.reps} ${
              exercise.style !== 'TUT' ? 'reps' : 'seconds'
            } @ ${
              lastSet.intensity
            }${lastSet?.intensityType?.toUpperCase()}`}</Text>
          </View>
        </View>
      )}

      <View style={[styles.exerciseRow, { justifyContent: 'flex-end' }]}>
        <Pressable
          onPress={() =>
            navigation.navigate('Exercise History', { movementDoc: exerciseID })
          }
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text category='label' appearance='hint'>
            History
          </Text>
          <Icon
            name='chevron-right-outline'
            fill={theme['text-hint-color']}
            style={{ width: 22, height: 22 }}
          />
        </Pressable>
      </View>

      <Divider style={{ marginVertical: 20 }} />
    </View>
  )
  const coachingCues = useMemo(() => exerciseInfo?.coachingCues, [exerciseInfo])

  const splitCues = useMemo(
    () => coachingCues?.split('^').filter((item) => item.trim()),
    [coachingCues]
  )

  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}>
        {exerciseDetails}
        {exerciseSettings}

        {isExerciseSwap && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              marginVertical: 15,
            }}>
            <Button
              onPress={() => handleExerciseChange()}
              status='success'
              appearance='filled'
              style={{ width: '90%' }}>
              Select Exercise
            </Button>
          </View>
        )}
        {exercise?.isUserExercise && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 10,
              width: '100%',
            }}>
            <Button
              onPress={() => handleDeleteExercise()}
              status='danger'
              appearance='ghost'>
              Delete Exercise
            </Button>
            <Button
              status='primary'
              onPress={() =>
                navigation.navigate('Create Exercise', { exercise })
              }
              appearance='ghost'>
              Edit Exercise
            </Button>
          </View>
        )}

        {!exercise?.isUserExercise &&
          !isEmpty(exercise) &&
          isLoaded(exercise) &&
          exerciseInfo && (
            <View>
              {exerciseInfo?.description && (
                <View style={{ paddingHorizontal: 15, marginBottom: 15 }}>
                  <Text category='h4' style={{ marginBottom: 5 }}>
                    Description
                  </Text>
                  <Text category='p2' style={{ fontSize: 17, lineHeight: 20 }}>
                    {exerciseInfo?.description}
                  </Text>
                </View>
              )}

              <PillarsSection
                exerciseShortcode={exerciseInfo?.exerciseShortcode}
                deadliftStyle={userLifterProfile?.deadlift.style}
              />

              {splitCues && (
                <View style={{ paddingHorizontal: 20 }}>
                  <Text
                    category='h4'
                    style={{ marginBottom: 10, marginTop: 15 }}>
                    Coaching Cues
                  </Text>
                  {splitCues?.map((cue, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        marginBottom: 5,
                        paddingRight: 15,
                      }}>
                      <Icon
                        style={{
                          width: 10,
                          height: 10,
                          marginRight: 10,
                          marginTop: 5,
                        }}
                        fill={theme['text-basic-color']}
                        name='radio-button-off'
                      />
                      <Text category='p2'>{cue}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        <View style={{ padding: 15, marginBottom: 15 }}>
          <Divider />
          <Pressable
            onPress={() =>
              navigation.navigate('Notes Screen', {
                exercise: exercise,
                notesType: 'exercise',
              })
            }>
            <Text category='h4' style={{ marginTop: 15 }}>
              Notes{' '}
              <Icon
                style={{ width: 22, height: 22 }}
                fill='white'
                name='edit-outline'
              />
            </Text>

            <Text category='p2'>
              {exercise?.userNotes ? exercise?.userNotes : 'Enter notes...'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // zIndex: 1000
  },
})
