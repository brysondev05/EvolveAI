import { useFocusEffect } from '@react-navigation/native'
import {
  Layout,
  Text,
  useTheme,
  Button,
  Input,
  Icon,
} from '@ui-kitten/components'
import LottieView from 'lottie-react-native'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LayoutCard from '~/components/presentational/containers/LayoutCard'

const MeditateScreen = ({ navigation, route }) => {
  const { adjustmentValues, readinessScores } = route.params || {}
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        dispatch({
          type: 'TOGGLE_FINISH_WORKOUT_SHEET',
          adjustmentValues,
          readinessScores,
        })
        navigation.goBack()
      }, 180000)

      return () => clearTimeout(timer)
    }, [])
  )

  return (
    <Layout style={{ flex: 1 }} level='3'>
      <LayoutCard>
        <Text category='h6' status='primary'>
          Thought for the day
        </Text>
        <Text>
          “You can’t stop the waves but you can learn how to surf” – Jon
          Kabat-Zinn. Training (and life) isn’t always going to go perfectly,
          but you can control how you react to those less than great days.{' '}
        </Text>
      </LayoutCard>
      <LottieView
        source={require('../assets/animations/box_med.json')}
        autoPlay
        loop
        autoSize
      />
    </Layout>
  )
}

export default MeditateScreen
