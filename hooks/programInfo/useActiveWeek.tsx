import { useEffect, useState } from 'react'
import { useTypedSelector } from '~/reduxStore/reducers'
import { isLoaded, isEmpty } from 'react-redux-firebase'

export default function useActiveWeek() {
  const programWeeks = useTypedSelector(
    ({ firestore: { data } }) => data.programWeeks
  )
  const currentWeek = useTypedSelector(
    ({ firebase: { profile } }) => profile?.currentWeek
  )
  const [activeWeekNum, setActiveWeek] = useState(currentWeek)

  const activeWeek = useTypedSelector(
    ({ firestore: { data } }) =>
      data.programWeeks && data.programWeeks?.[`week${activeWeekNum}`]
  )

  useEffect(() => {
    setActiveWeek(currentWeek)
  }, [currentWeek])

  useEffect(() => {
    if (
      typeof programWeeks !== 'undefined' &&
      !activeWeek?.blockType &&
      isLoaded(programWeeks) &&
      !isEmpty(programWeeks)
    ) {
      setActiveWeek(1)
    }
  }, [programWeeks, activeWeek?.blockType])
  if (isLoaded(activeWeek) && !isEmpty(activeWeek)) {
    return {
      activeWeek,
      setActiveWeek,
    }
  }

  return {
    activeWeek: null,
    setActiveWeek: (week) => setActiveWeek(week),
  }
}
