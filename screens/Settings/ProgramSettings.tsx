import { View, Text, Alert } from 'react-native'
import { Layout } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import MenuItem from '~/components/presentational/MenuItem'
import { useDispatch } from 'react-redux'
import {
  clearProgram,
  regenerateProgram,
  restoreQuestionnaireData,
} from '~/reduxStore/actions/signUpActions'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useTypedSelector } from '~/reduxStore/reducers'
import { resetPreview } from '~/reduxStore/reducers/userProgram'

export default function ProgramSettings({ navigation }) {
  const dispatch = useDispatch()
  const { showActionSheetWithOptions } = useActionSheet()

  const userProgram = useTypedSelector(
    ({ firestore: { data } }) => data?.userProgram
  )

  const handleClearProgram = async ({ reset = 'full' }) => {
    if (reset !== 'full') {
      await dispatch(restoreQuestionnaireData())
    }
    await dispatch(resetPreview())
    navigation.navigate('ProgramCreation', {
      programCreationType:
        reset === 'full' ? 'signUpScreens' : 'existingUserScreens',
      screen: reset === 'full' ? 'UserBioData' : 'ProgramSelection',
    })
  }

  // const handleFactoryReset = () => {

  //   showActionSheetWithOptions({
  //     options:['Yes, delete my program', 'Cancel'],
  //     cancelButtonIndex: 1,
  //     destructiveButtonIndex: 0,
  //     message: 'This will delete any previous program and reset all your data',
  //     title: 'Are you sure?'

  // },
  // buttonIndex => {
  //     if(buttonIndex === 0) {
  //       return handleClearProgram({reset: 'full'})

  //     }
  // })

  // }

  const dumbDumbCheck = (resetType) => {
    Alert.alert(
      'Warning',
      'This will delete your current training program and you will lose previous completed training days',
      [
        {
          text: 'Create New Program',
          onPress: () =>
            resetType === 'full'
              ? handleClearProgram({ reset: 'full' })
              : handleClearProgram({ reset: 'trainingOnly' }),
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
    if (!userProgram) {
      return dumbDumbCheck('full')
    }
    showActionSheetWithOptions(
      {
        options: ['Create New Program', 'Full Reset', 'Cancel'],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 1,
        message:
          'Do you want to keep your current volume data or reset and start from scratch? Creating any new program will remove your current program and previous weeks will be removed. ',
        title: 'New Program',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          return dumbDumbCheck('trainingOnly')
        }
        if (buttonIndex === 1) {
          return dumbDumbCheck('full')
        }
      }
    )
  }

  const handleRegenerateProgram = () => {
    showActionSheetWithOptions(
      {
        options: ['Yes, regenerate my program', 'Cancel'],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
        message:
          'This will regenerate your current program and you will lose your previous progress. We do not recommend doing this unless instructed by support.',
        title: 'Are you sure?',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          return dispatch(regenerateProgram())
        }
      }
    )
  }

  const mainSettings = [
    {
      heading: 'Training Days',
      subheading: 'Modify the days per week you train',
      linkTo: 'TrainingDays',
      hasProgram: userProgram,
    },

    {
      heading: 'Meet Date',
      subheading: 'Reset your cycle and pick a new meet date',
      linkTo: 'MeetDate',
      hasProgram: userProgram,
    },
    // {
    //     heading: 'Regenerate Program',
    //     subheading: 'Reset your current program and start over',
    //     action: () => handleRegenerateProgram()
    // },
    {
      heading: 'New Program',
      subheading: 'Clear your current program and plan your next cycle',
      action: () => handleNewProgram(),
      hasProgram: true,
    },
  ]

  return (
    <Layout style={{ flex: 1 }}>
      <GradientHeader title='My Program' />
      {mainSettings.map((item) => (
        <MenuItem
          heading={item.heading}
          subheading={item.subheading}
          linkTo={item.linkTo}
          key={item.heading}
          navigation={navigation}
          action={item.action}
          hasProgram={item.hasProgram}
        />
      ))}
      <Text></Text>
    </Layout>
  )
}
