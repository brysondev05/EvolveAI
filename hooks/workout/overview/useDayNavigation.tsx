import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '~/reduxStore/reducers'
import { setActiveDay } from '~/reduxStore/reducers/userProgram'
import useActiveWeek from '../../programInfo/useActiveWeek'
import { useDayNumber } from './useDayNumber'

export const useDayNavigation = ({ activeWeek }) => {
  const { activeWeek: stateActiveWeek, setActiveWeek } = useActiveWeek()
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )
  const dispatch = useDispatch()
  const day = useDayNumber()

  const navigateToTraining = useCallback(
    async (type) => {
      const maxLength = activeWeek?.trainingDayStatus.length

      if (type === 'next') {
        if (day < maxLength) {
          return dispatch(
            setActiveDay({
              activeDay: day + 1,
              activeWeek: activeWeek?.startingWeek,
            })
          )
        }
        const nextWeekStatus =
          programWeeks?.[`week${activeWeek?.startingWeek + 1}`]?.status
        if (nextWeekStatus && nextWeekStatus !== 'holding') {
          await dispatch({
            type: '@@reduxFirestore/CLEAR_DATA',
            preserve: {
              ordered: ({ dayInfo, ...rest }) => rest,
              data: ({ dayInfo, ...rest }) => rest,
            },
          })
          setActiveWeek(activeWeek?.startingWeek + 1)
          return dispatch(
            setActiveDay({
              activeDay: 1,
              activeWeek: activeWeek?.startingWeek + 1,
            })
          )
        }
      }
      if (day > 1 && type === 'previous') {
        return dispatch(
          setActiveDay({
            activeDay: day - 1,
            activeWeek: activeWeek?.startingWeek,
          })
        )
      }

      const prevWeekStatus =
        programWeeks?.[`week${activeWeek?.startingWeek - 1}`]?.status
      if (type === 'previous' && prevWeekStatus) {
        await dispatch({
          type: '@@reduxFirestore/CLEAR_DATA',
          preserve: {
            ordered: ({ dayInfo, ...rest }) => rest,
            data: ({ dayInfo, ...rest }) => rest,
          },
        })
        setActiveWeek(activeWeek?.startingWeek - 1)
        return dispatch(
          setActiveDay({
            activeDay: maxLength,
            activeWeek: activeWeek?.startingWeek - 1,
          })
        )
      }

      return null
    },
    [activeWeek?.startingWeek, activeWeek?.trainingDayStatus, day]
  )

  return { navigateToTraining }
}
