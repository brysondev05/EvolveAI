import { useTypedSelector } from '~/reduxStore/reducers'

export const useDayNumber = () => {
  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered?.dayInfo?.[0]
  )

  return Number(activeDay?.id?.split('_').pop())
}
