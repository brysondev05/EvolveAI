import { useEffect } from 'react'
import * as StoreReview from 'expo-store-review'
import moment from 'moment'
import { handleError } from '~/errorReporting'

import { useMMKVObject } from 'react-native-mmkv'

type reviews = {
  lastSent: Date
  timesShown: number
}

const useReviews = ({ shouldShow, currentWeek }) => {
  const [reviews, setReviews] = useMMKVObject('reviews')

  useEffect(() => {
    let canContinue = true
    const reviewAsync = async () => {
      const hasAction = await StoreReview.hasAction()
      const isAvailable = await StoreReview.isAvailableAsync()
      const lastDate = moment(reviews?.lastSent)

      if (
        isAvailable &&
        hasAction &&
        currentWeek > 1 &&
        (reviews?.timesShown === 0 ||
          !reviews?.timesShown ||
          (moment().diff(lastDate, 'weeks') >= 2 && reviews?.timesShown <= 4))
      ) {
        try {
          StoreReview.requestReview()
          setReviews({
            timesShown: reviews?.timesShown + 1,
            lastSent: new Date(),
          })
        } catch (e) {
          handleError(e)
        }
      }
    }
    if (shouldShow && canContinue) {
      reviewAsync()
    }

    return () => {
      canContinue = false
    }
  }, [shouldShow])
}

export default useReviews
