import { useState, useMemo, useEffect } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Layout, Text, Button, Icon, useTheme } from '@ui-kitten/components'
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'

import { useTypedSelector } from '~/reduxStore/reducers'
import { useDispatch } from 'react-redux'
import { createMeetDayNumbers } from '~/reduxStore/actions/powerlifting/MeetDay/MeetDayActions'
import AttemptCard from '~/components/MeetDay/AttemptCard/AttemptCard'
import GradientHeader from '~/components/presentational/GradientHeader'
import { CommonActions } from '@react-navigation/native'
import { convertToKG } from '~/helpers/Calculations'

const EditIcon = (props) => <Icon {...props} name='edit-outline' />

const handleKGConvert = (max) => {
  if (max) {
    const { amount, units } = max
    if (units != 'kg') {
      return convertToKG(amount)
    }
    return amount
  }
  return null
}
const MeetDayHeader = ({ dispatch, theme }) => (
  <Pressable
    onPress={() => dispatch({ type: 'OPEN_INFO_SHEET', infoType: 'meetDay' })}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <Text category='h1'>Meet Day</Text>
    <Icon
      style={{ width: 25, height: 25, marginTop: 5, marginLeft: 10 }}
      fill={theme['text-hint-color']}
      name='info-outline'
    />
  </Pressable>
)
const UnitTypeButton = ({ type, units, setUnits }) => (
  <Button
    key={type}
    size='small'
    style={{ borderRadius: 0 }}
    onPress={() => setUnits(type)}
    appearance={units === type ? 'filled' : 'outline'}>
    {type}
  </Button>
)

export default function MeetDayScreen({ navigation, route }) {
  const userID = useTypedSelector(({ firebase: { auth } }) => auth.uid)

  const meetDay = useTypedSelector(({ firestore: { data } }) => data.meetDay)

  const [units, setUnits] = useState('kg')

  const mainLifts = useTypedSelector(
    ({ firestore: { data } }) => data.mainLifts
  )

  const dispatch = useDispatch()
  const theme = useTheme()
  useFirestoreConnect([
    {
      collection: `users/${userID}/program`,
      doc: 'meetDay',
      storeAs: 'meetDay',
    },
    {
      collection: `users/${userID}/exercises`,
      where: ['exerciseShortcode', 'in', ['SQ0', 'BN0', 'DL0']],
      storeAs: 'mainLifts',
    },
  ])

  const liftMaxes = useMemo(() => {
    return {
      squat: handleKGConvert(mainLifts?.SQ0?.max),
      bench: handleKGConvert(mainLifts?.BN0?.max),
      deadlift: handleKGConvert(mainLifts?.DL0?.max),
    }
  }, [mainLifts])

  useEffect(() => {
    if (isLoaded(meetDay) && isEmpty(meetDay)) {
      dispatch(createMeetDayNumbers())
    }
  }, [meetDay])

  const lifts = ['squat', 'bench', 'deadlift']

  const unitTypes = ['lb', 'kg']
  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView>
        <GradientHeader
          HeaderComponentObject={
            <MeetDayHeader dispatch={dispatch} theme={theme} />
          }
        />
        <View
          style={{
            justifyContent: 'space-between',
            padding: 20,
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text appearance='hint' category='label'>
            Units
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {unitTypes.map((type) => (
              <UnitTypeButton type={type} units={units} setUnits={setUnits} />
            ))}
          </View>
        </View>

        {!isEmpty(meetDay) &&
          lifts.map((lift, index) => {
            const attemptData = meetDay[lift]

            return (
              <View key={`${lift}${index}`} style={{ padding: 15 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}>
                  <Text category='h2' style={{ textTransform: 'capitalize' }}>
                    {lift}
                  </Text>

                  <Button
                    status='basic'
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 0,
                      paddingRight: 0,
                    }}
                    appearance='ghost'
                    onPress={() =>
                      navigation.navigate('Update Meet Max', {
                        max: attemptData.third.attempt.weight,
                        units: attemptData.third.attempt.units,
                        lift,
                      })
                    }
                    accessoryRight={EditIcon}>
                    Estimated Max:{' '}
                    {`${attemptData.third.attempt.weight}${attemptData.third.attempt.units}`}
                  </Button>
                </View>
                {attemptData &&
                  Object.entries(attemptData)
                    .sort(([a], [b]) => (a < b ? -1 : 1))
                    .map(([attempt, details], index, arr) => {
                      const isLast = index === arr?.length - 1
                      return (
                        <Layout
                          key={index}
                          level='2'
                          style={{
                            borderRadius: 14,
                            paddingVertical: 15,
                            paddingHorizontal: 15,
                            marginBottom: 15,
                            paddingBottom: 30,
                          }}>
                          <AttemptCard
                            lift={lift}
                            key={attempt}
                            type={attempt}
                            isLast={isLast}
                            details={details}
                            max={liftMaxes[lift]}
                            units={units}
                          />
                        </Layout>
                      )
                    })}
              </View>
            )
          })}

        <View style={{ paddingHorizontal: 15, marginBottom: 30 }}>
          <Button
            status='success'
            size='large'
            onPress={() =>
              navigation.navigate('Meet Day Review', {
                userUnits: units.toLowerCase() === 'lb' ? 0 : 1,
              })
            }>
            Complete Meet
          </Button>
          <Button
            style={{ marginTop: 15 }}
            status='primary'
            appearance='outline'
            size='large'
            onPress={() => dispatch(createMeetDayNumbers())}>
            Re-Calculate Attempts
          </Button>
        </View>
      </ScrollView>
    </Layout>
  )
}
