import moment from 'moment-timezone'
import { useMemo, useCallback } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import useActiveWeek from './useActiveWeek'
import { useBlockType } from './useBlockType'
import * as Localization from 'expo-localization'
import { dateToDate } from '~/helpers/Dates'
import { useDayNumber } from '../workout/overview/useDayNumber'
import { useProgramID } from './useProgramID'

export const useProgramInfo = () => {
  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data.userProgram
  )
  const auth = useTypedSelector(({ firebase: { auth } }) => auth)
  const profile = useTypedSelector(({ firebase: { profile } }) => profile)
  const day = useDayNumber()
  const programID = useProgramID()
  const { activeWeek, setActiveWeek } = useActiveWeek()

  const blockType = activeWeek?.blockType || ''

  const timezone =
    userProgram?.programDetails?.userProgramData?.timezone ||
    Localization.timezone

  const { blockColor, blockName } = useBlockType({ blockType })
  const actualMeetDate = useMemo(
    () =>
      moment
        .tz(dateToDate(userProgram?.cycleStructure?.meetDate), timezone)
        .toDate(),
    [userProgram, timezone]
  )
  const meetDate = useMemo(() => {
    if (actualMeetDate) {
      const convDate = moment.tz(actualMeetDate, timezone)

      return convDate.diff(moment.tz({ hours: 0 }, timezone), 'days')
    }
    return null
  }, [actualMeetDate])

  const formattedMeetDate = useMemo(
    () => moment.tz(actualMeetDate, timezone).format('dddd, MMMM Do YYYY'),
    [userProgram]
  )

  const pendingDays = useMemo(
    () =>
      activeWeek?.trainingDayStatus?.filter((day) =>
        ['pending', 'active'].includes(day)
      ),
    [activeWeek]
  )

  return {
    activeWeek,
    setActiveWeek,
    blockType,
    timezone,
    blockColor,
    blockName,
    actualMeetDate,
    meetDate,
    formattedMeetDate,
    pendingDays,
    userID: auth?.uid,
    userRole: profile.role,
    profile,
    week: activeWeek?.startingWeek,
    day,
    units: profile?.units,
    programID,
  }
}
