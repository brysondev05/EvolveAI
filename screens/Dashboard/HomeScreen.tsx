import { useCallback, useEffect, useState } from 'react'
import { Layout, useTheme, Text } from '@ui-kitten/components'
import { useTypedSelector } from '~/reduxStore/reducers'

import { useDispatch } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import OverviewGraph from '~/components/HomeScreen/OverviewGraph'

import { isLoaded } from 'react-redux-firebase'
import { EndOfWeekSheet } from '~/components/HomeScreen/EndOfWeekSheet'

import { useBlockColors } from '~/hooks/programInfo/useBlockColors'
import Diary from '~/components/HomeScreen/Diary/Diary'

import useSheetBackHandler from '~/hooks/utilities/useSheetBackHandler'
import useSubscription from '~/hooks/useSubscription'
import { useProgramInfo } from '~/hooks/programInfo/useProgramInfo'
import { useWeekNavigation } from '~/hooks/homescreen/useWeekNavigation'
import { getProgramWeeks } from '~/reduxStore/actions/programActions'
import { Alert, RefreshControl } from 'react-native'
import { showErrorNotification } from '~/reduxStore/reducers/notifications'
import { syncUserSubscriptions } from '~/reduxStore/reducers/iapSubscription'
import { FREE_USER_ROLES, SUBSCRIPTION_ENABLED } from '~/constants/main'

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch()
  const theme = useTheme()

  const colors = useBlockColors()

  // const subscription = useTypedSelector(state => state.subscription)
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )
  const programBlocks = useTypedSelector(
    ({ firestore: { data } }) => data.programBlocks
  )

  const userProfile = useTypedSelector(({ firebase: { profile } }) => profile)

  useSheetBackHandler()

  const {
    activeWeek,
    setActiveWeek,
    timezone,
    blockColor,
    blockName,
    formattedMeetDate,
    pendingDays,
    meetDate,
  } = useProgramInfo()

  const { navigateToTraining, handleWeekChange } = useWeekNavigation({
    navigation,
    activeWeek,
    setActiveWeek,
  })
  const [refreshing, setRefreshing] = useState(false)

  const { hasSubscription } = useSubscription()

  useEffect(() => {
    if (
      !hasSubscription &&
      isLoaded(userProfile) &&
      !FREE_USER_ROLES?.includes(userProfile?.role) &&
      SUBSCRIPTION_ENABLED
    ) {
      navigation.navigate('Subscription')
    }
  }, [hasSubscription, userProfile])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await dispatch(getProgramWeeks())
    await dispatch(syncUserSubscriptions())
    setRefreshing(false)
  }, [])

  const handleEndOfWeek = useCallback(() => {
    if (pendingDays?.length > 0 && userProfile?.role !== 'admin' && !__DEV__) {
      return dispatch(
        showErrorNotification({
          title: 'Week Not Complete',
          description:
            'Please complete each day before moving on to your next week',
        })
      )
    }

    const proceed = () =>
      navigation.navigate('End of block', {
        week: activeWeek?.startingWeek,
        blockType: activeWeek?.blockType,
        blockVolume: activeWeek?.blockVolume,
        cycleID: activeWeek?.cycleID,
      })
    if (activeWeek.status === 'complete') {
      Alert.alert(
        'Week already complete',
        'This week has already completed, completing the week again will clear your next week. If this week is the end of a block, it will clear the entire next block.',
        [
          {
            text: 'Proceed',
            onPress: () => proceed(),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      )
    } else {
      proceed()
    }
  }, [pendingDays, activeWeek, userProfile])

  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView
        // scrollEventThrottle={100}
        // bounces={false}
        style={{ zIndex: 200, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <OverviewGraph />
        {typeof activeWeek !== 'undefined' && activeWeek?.blockType && (
          <Diary
            navigation={navigation}
            programIsLoaded={isLoaded(programWeeks)}
            activeWeek={activeWeek}
            theme={theme}
            meetDate={meetDate}
            blockColor={blockColor}
            blockName={blockName}
            handleWeekChange={handleWeekChange}
            colors={colors}
            timezone={timezone}
            navigateToTraining={navigateToTraining}
            pendingDays={pendingDays}
            handleEndOfWeek={handleEndOfWeek}
            formattedMeetDate={formattedMeetDate}
            blockStatus={programBlocks?.[`Block${activeWeek.cycleID}`]?.status}
          />
        )}
      </ScrollView>
      {typeof activeWeek !== 'undefined' && activeWeek?.blockType && (
        <EndOfWeekSheet
          navigation={navigation}
          week={activeWeek?.startingWeek}
          blockType={activeWeek?.blockType}
          blockVolume={activeWeek?.blockVolume}
          cycleID={activeWeek?.cycleID}
        />
      )}
    </Layout>
  )
}
