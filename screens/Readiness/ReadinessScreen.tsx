import { useLayoutEffect } from 'react'
import { StyleSheet } from 'react-native'

import { useForm, Controller } from 'react-hook-form'
import {
  Layout,
  Text,
  Icon,
  Button,
  CheckBox,
  RadioGroup,
  Radio,
  Input,
} from '@ui-kitten/components'

import GradientHeader from '~/components/presentational/GradientHeader'
import ReadinessButtonSwitch from '~/components/Readiness/ReadinessButtonSwitch'
import { convertToKG, convertToLB, round } from '~/helpers/Calculations'
import NumberInput from '~/components/presentational/NumberInput'
import { useProgramInfo } from '~/hooks/programInfo/useProgramInfo'
import { useSetReadiness } from '~/hooks/workout/readiness/useSetReadiness'
import LayoutCard from '~/components/presentational/containers/LayoutCard'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const nextIcon = (props) => <Icon {...props} name='arrow-forward-outline' />

const tirednessRatings = [
  ['1', 'Feeling tired and not very strong'],
  ['2', 'Feeling a little tired/weak'],
  ['3', 'Feeling normal'],
  ['4', 'Feeling good, no tiredness or weakness'],
  ['5', 'Feeling great and ready to do extra work!'],
]

const dietRatings = [
  ['1', 'Missed meals or feeling hungry'],
  ['2', 'Ate sufficient calories for cutting'],
  ['3', 'Ate sufficient calories for maintenance'],
  ['4', 'Ate in caloric surplus'],
  ['5', 'Ate in caloric surplus with nutrient dense foods'],
]

const moodRatings = [
  ['1', 'Low'],
  ['2', 'Below average'],
  ['3', 'Normal'],
  ['4', 'Good'],
  ['5', 'Great'],
]

const sleepRatings = [
  ['1', 'Less than 5 hours of quality sleep'],
  ['2', '5-6 hours of quality sleep'],
  ['3', '6-8 hours of quality sleep'],
  ['4', '8-9 hours of quality sleep'],
  ['5', 'More than 9 hours of quality sleep'],
]

const fullFormContent = [
  {
    formName: 'userSleep',
    title: 'How did you sleep last night?',
    options: sleepRatings,
  },
  {
    formName: 'userMotivation',
    title: 'How would you characterize your mood/motivation to train?',
    options: moodRatings,
  },
  {
    formName: 'userDiet',
    title: 'How would you rate your diet in the last 24 hours?',
    options: dietRatings,
  },
  {
    formName: 'userBody',
    title: 'Do you feel strong and well recovered today?',
    options: tirednessRatings,
  },
]

const offDayContent = [
  {
    formName: 'userSleep',
    title: 'How did you sleep last night?',
    options: sleepRatings,
  },
  {
    formName: 'userDiet',
    title: 'How would you rate your diet in the last 24 hours?',
    options: dietRatings,
  },
  {
    formName: 'userBody',
    title: 'Do you feel strong and well recovered today?',
    options: tirednessRatings,
  },
  {
    formName: 'userUpperBody',
    title: "How's your upper body feeling?",
    options: tirednessRatings,
  },
  {
    formName: 'userLowerBody',
    title: "How's your lower body feeling?",
    options: tirednessRatings,
  },
]

const bodypartButtons = [
  {
    name: 'Pecs / Shoulders / Triceps',
    // readiness: userPec,
    objName: 'userPec',
  },
  {
    name: 'Lats / Traps / Biceps',
    // readiness: userLat,
    objName: 'userLat',
  },
  {
    name: 'Lower Back',
    // readiness: userLB,
    objName: 'userLB',
  },
  {
    name: 'Glutes / Hamstrings',
    // readiness: userGlutes,
    objName: 'userGlutes',
  },
  {
    name: 'Quads',
    // readiness: userQuads,
    objName: 'userQuads',
  },
]

const ReadinessScreen = ({ navigation, route }) => {
  const { isOffDay = false } = route.params || {}

  useLayoutEffect(() => {
    if (isOffDay) {
      navigation.setOptions({
        presentation: 'modal',
        headerRight: () => null,
      })
    } else {
    }
  }, [isOffDay])

  const { week, day, programID, units, profile, userID } = useProgramInfo()

  const { value: bodyweight = '100', units: bodyweightUnits = units } =
    profile.bodyweight || {}

  const formContent = isOffDay ? offDayContent : fullFormContent

  let unitString = units === 1 ? 'kg' : 'lb'
  const initialBodyweight =
    bodyweightUnits === units || bodyweightUnits === unitString
      ? bodyweight
      : ['kg', '1'].includes(String(bodyweightUnits))
      ? convertToLB(Number(bodyweight))
      : convertToKG(Number(bodyweight))

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userSleep: 2,
      userMotivation: 2,
      userBody: 2,
      userDiet: 2,
      userUpperBody: 2,
      userLowerBody: 2,
      userBodyweight: String(initialBodyweight),
      isOffDayCheckin: isOffDay,
      sessionMindset: '',
      userBodyParts: {
        userPec: 2,
        userLat: 2,
        userLB: 2,
        userGlutes: 2,
        userQuads: 2,
      },
      rehab: {
        squat: false,
        bench: false,
        deadlift: false,
      },
      rehabWeeks: {
        squat: 0,
        bench: 0,
        deadlift: 0,
      },
    },
  })

  const activeRehab = watch('rehab')

  const { createUserReadiness, handleBodyweightChange } = useSetReadiness({
    day,
    week,
    programID,
    userID,
    isOffDay,
    setValue,
    getValues,
    units,
    navigation,
  })

  return (
    <Layout style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraHeight={30}
        enableOnAndroid
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <GradientHeader paddedTop title='Readiness Check-in' />
        <Layout style={{ flex: 1, padding: 20 }} level='1'>
          {!isOffDay && (
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              name='userBodyweight'
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Layout
                    level='2'
                    style={[styles.secondLayout, { paddingHorizontal: 0 }]}>
                    <Layout level='2' style={{ paddingHorizontal: 15 }}>
                      <Text category='h6'>Current bodyweight</Text>
                    </Layout>

                    <NumberInput
                      value={value}
                      units={units}
                      onChangeText={onChange}
                      handleChange={handleBodyweightChange}
                      canEdit={true}
                      placeholder='BW'
                      label=''
                      level='2'
                    />
                  </Layout>
                </>
              )}
            />
          )}
          {formContent.map((item) => (
            <Controller
              key={item.formName}
              control={control}
              rules={{
                required: true,
              }}
              name={item.formName}
              render={({ field: { onChange, onBlur, value } }) => (
                <ReadinessButtonSwitch
                  title={item.title}
                  onChange={onChange}
                  value={value}
                  options={item.options}
                  errors={errors && errors[item.formName]}
                />
              )}
            />
          ))}
        </Layout>
        <Layout level='2' style={styles.secondLayout}>
          <Text category='h6' style={styles.cardHeading}>
            {`How's your body feeling?`}
          </Text>
          {bodypartButtons.map((item) => (
            <Controller
              key={item.objName}
              control={control}
              rules={{
                required: true,
              }}
              name={`userBodyParts.${item.objName}`}
              render={({ field: { onChange, onBlur, value } }) => (
                <ReadinessButtonSwitch
                  title={item.name}
                  onChange={onChange}
                  value={value}
                  options={tirednessRatings}
                  errors={errors && errors[`userBodyParts.${item.objName}`]}
                />
              )}
            />
          ))}
        </Layout>

        <Controller
          control={control}
          name='sessionMindset'
          render={({ field: { onChange, onBlur, value } }) => (
            <LayoutCard>
              <Text category='h6'>Mindset Preparation</Text>
              <Text category='c1' appearance='hint'>
                Time to get focused! What is something you hope to achieve
                today? For example, today I am going to focus on consistent
                technique in all sets.
              </Text>
              <Input
                status='primary'
                multiline
                returnKeyType='done'
                blurOnSubmit
                onChangeText={onChange}
                value={value}
                style={{ marginVertical: 15 }}
                textStyle={{ minHeight: 60 }}
                placeholder='Today I am going to...'
              />
            </LayoutCard>
          )}
        />
        <Layout level='2' style={[styles.secondLayout, { marginBottom: 0 }]}>
          <Text category='h6' style={styles.cardHeading}>
            Are you currently rehabbing any injuries?
          </Text>
          <Text style={{ marginBottom: 5 }}>
            If you have been cleared by a health professional to re-introduce
            these lifts to your workouts, use these rehab protocols.
          </Text>
          <Controller
            control={control}
            name='rehab.squat'
            render={({ field: { onChange, onBlur, value } }) => (
              <CheckBox
                style={styles.rehabChecks}
                checked={value}
                onChange={onChange}>
                Squat
              </CheckBox>
            )}
          />
          <Controller
            control={control}
            name='rehab.bench'
            render={({ field: { onChange, onBlur, value } }) => (
              <CheckBox
                style={styles.rehabChecks}
                checked={value}
                onChange={onChange}>
                Bench
              </CheckBox>
            )}
          />
          <Controller
            control={control}
            name='rehab.deadlift'
            render={({ field: { onChange, onBlur, value } }) => (
              <CheckBox
                style={styles.rehabChecks}
                checked={value}
                onChange={onChange}>
                Deadlift
              </CheckBox>
            )}
          />

          {activeRehab.squat && (
            <Layout level='2' style={{ marginTop: 20 }}>
              <Text category='s1'>Squat Rehab Week</Text>
              <Controller
                control={control}
                name='rehabWeeks.squat'
                render={({ field: { onChange, onBlur, value } }) => (
                  <RadioGroup
                    selectedIndex={value}
                    onChange={onChange}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Radio style={styles.radioButton}>1</Radio>
                    <Radio style={styles.radioButton}>2</Radio>
                    <Radio style={styles.radioButton}>3</Radio>
                    <Radio style={styles.radioButton}>4</Radio>
                    <Radio style={styles.radioButton}>5</Radio>

                    <Radio style={styles.radioButton}>6</Radio>
                  </RadioGroup>
                )}
              />
            </Layout>
          )}

          {activeRehab.bench && (
            <Layout level='2' style={{ marginTop: 20 }}>
              <Text category='s1'>Bench Rehab Week</Text>
              <Controller
                control={control}
                name='rehabWeeks.bench'
                render={({ field: { onChange, onBlur, value } }) => (
                  <RadioGroup
                    selectedIndex={value}
                    onChange={onChange}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Radio style={styles.radioButton}>1</Radio>
                    <Radio style={styles.radioButton}>2</Radio>
                    <Radio style={styles.radioButton}>3</Radio>
                    <Radio style={styles.radioButton}>4</Radio>
                    <Radio style={styles.radioButton}>5</Radio>

                    <Radio style={styles.radioButton}>6</Radio>
                  </RadioGroup>
                )}
              />
            </Layout>
          )}

          {activeRehab.deadlift && (
            <Layout level='2' style={{ marginTop: 20 }}>
              <Text category='s1'>Deadlift Rehab Week</Text>
              <Controller
                control={control}
                name='rehabWeeks.deadlift'
                render={({ field: { onChange, onBlur, value } }) => (
                  <RadioGroup
                    selectedIndex={value}
                    onChange={onChange}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Radio style={styles.radioButton}>1</Radio>
                    <Radio style={styles.radioButton}>2</Radio>
                    <Radio style={styles.radioButton}>3</Radio>
                    <Radio style={styles.radioButton}>4</Radio>
                    <Radio style={styles.radioButton}>5</Radio>

                    <Radio style={styles.radioButton}>6</Radio>
                  </RadioGroup>
                )}
              />
            </Layout>
          )}
        </Layout>

        <Button
          status='secondary'
          style={styles.button}
          size='giant'
          accessoryRight={nextIcon}
          onPress={handleSubmit(createUserReadiness)}>
          {isOffDay ? 'Complete Check-in' : 'Start Workout'}
        </Button>
      </KeyboardAwareScrollView>
    </Layout>
  )
}

export default ReadinessScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  select: {
    flex: 0,
    width: '100%',
    margin: 2,
  },
  secondLayout: {
    padding: 20,
    marginTop: 15,
    // marginBottom: 25,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    marginHorizontal: 10,
    marginBottom: 30,
    flex: 1,
  },
  m10: {
    marginTop: 10,
    marginBottom: 10,
  },
  rehabChecks: {
    marginVertical: 5,
  },
  radioButton: {
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'space-between',
  },
  cardHeading: {
    marginBottom: 15,
  },
})
