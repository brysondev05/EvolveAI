import moment from 'moment'
import { dateToDate } from '~/helpers/Dates'
import { useTypedSelector } from '~/reduxStore/reducers'

export const useProgramID = () => {
  const startDate = useTypedSelector(
    ({ firestore: { data } }) =>
      data.userProgram?.programDetails?.userProgramData?.startDate
  )

  return moment(dateToDate(startDate)).format('YYYYMMDD')
}
