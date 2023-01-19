import { StyleSheet, View, Alert } from 'react-native'
import { Layout, Card, Button, Text } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import { restoreQuestionnaireData, clearProgram } from '~/reduxStore/actions'
import { useDispatch } from 'react-redux'
import { useFirestoreConnect } from 'react-redux-firebase'
import { useTypedSelector } from '~/reduxStore/reducers'
import { ScrollView } from 'react-native-gesture-handler'
import { resetPreview } from '~/reduxStore/reducers/userProgram'

const EndOfProgram = ({ navigation }) => {
  const userID = useTypedSelector((state) => state.firebase?.auth?.uid)

  const dispatch = useDispatch()

  const meetDay = useTypedSelector(({ firestore: { data } }) => data.meetDay)

  useFirestoreConnect([
    {
      collection: `users/${userID}/program`,
      doc: 'meetDay',
      storeAs: 'meetDay',
    },
  ])

  const handleNextProgram = async () => {
    await dispatch(restoreQuestionnaireData())
    await dispatch(resetPreview())
    return navigation.navigate('ProgramCreation', {
      programCreationType: 'existingUserScreens',
      screen: 'ProgramSelection',
    })
  }

  const proceedWithNew = () => {
    Alert.alert(
      'Ready for your next program?',
      `We can't wait to plan your next program! \n Doing so will clear your current program and plan your next cycle with all your updated data`,
      [
        {
          text: "Let's Go!",
          onPress: () => handleNextProgram(),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    )
  }

  const handleNewProgram = () => {
    if (meetDay?.status !== 'completed') {
      Alert.alert(
        'Meet Day Not Complete',
        `You have not complete your meet day results yet. Would you like to do that now?`,
        [
          {
            text: 'Enter Meet Day Results',
            onPress: () => navigation.navigate('Meet Day Review'),
          },

          {
            text: 'Skip Entering Meet Day results',
            onPress: () => proceedWithNew(),
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      )
    } else {
      proceedWithNew()
    }
  }
  return (
    <Layout style={{ flex: 1 }}>
      <ScrollView>
        <GradientHeader title='Congratulations' />
        <View style={{ padding: 15 }}>
          <Text style={styles.p}>
            Great Work! You've worked hard and finished this program. This is an
            important step for the System in evaluating your progress and
            learning more about how to best help you reach your goals.{' '}
          </Text>
          <Text style={styles.p}>
            During this time, your Volume Landmarks (MEV/MRV) will be further
            refined, based on your last program's results, to help your training
            become more efficient and effective. The relationship between MEV
            and MRV affects nearly all of the decisions the system makes about
            your program.
          </Text>
          <Text style={styles.p}>
            The time after a meet/mock meet is important to your long term
            success. More likely than not, you're probably feeling a bit beat
            up-that is fine and to be expected, or you may be feeling like
            you're chomping at the bit to start training hard again. Either way,
            we highly suggest that you spend some time in a Bridge Block.
          </Text>
          <Text style={styles.p}>
            A Bridge Block will help you heal any nagging injuries that may be
            hindering your training, it will help you develop more well rounded
            preparedness as you enter your next meet prep, better movement
            quality and work capacity. Doing a Bridge Block will also introduce
            some important variation to your training to help you avoid Adaptive
            Resistance so you can keep progressing for the long term.{' '}
          </Text>

          <Button onPress={handleNewProgram}>
            Configure your next training cycle
          </Button>
        </View>
      </ScrollView>
    </Layout>
  )
}

export default EndOfProgram

const styles = StyleSheet.create({
  p: {
    marginBottom: 10,
  },
})
