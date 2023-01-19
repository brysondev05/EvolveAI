import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react"
import { Keyboard, StyleSheet, TextInput } from "react-native"
import { useDispatch } from "react-redux"
import { postNotes } from "~/reduxStore/actions/programActions"
import { Text, Layout, Button, useTheme } from "@ui-kitten/components"
import { useFirestore } from "react-redux-firebase"
import { useProgramInfo } from "~/hooks/programInfo/useProgramInfo"
import { useDayNumber } from "~/hooks/workout/overview/useDayNumber"
import { useTypedSelector } from "~/reduxStore/reducers"

const NotesScreen = ({ navigation, route }) => {
  const { exercise, notesType, userNotes = "" } = route.params || {}
  const [notes, setNotes] = useState(userNotes)
  const [isSaving, setIsSaving] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(null)
  const theme = useTheme()

  const { programID } = useProgramInfo()

  const day = useDayNumber()
  const activeDay = useTypedSelector(
    ({ firestore: { ordered } }) => ordered?.dayInfo?.[0]
  )
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          style={{ marginRight: 15 }}
          disabled={isSaving}
          appearance="outline"
          status="success"
          size="small"
          onPress={handleNotesSave}
        >
          Save
        </Button>
      ),
    })
  }, [isSaving, notes])

  const dispatch = useDispatch()
  const inputRef = useRef(null)

  const { userID } = useProgramInfo()
  const firestore = useFirestore()

  useEffect(() => {
    if (exercise?.userNotes) {
      setNotes(exercise?.userNotes)
    }
  }, [route.params])

  const setExerciseNotes = useCallback(
    (notes) => {
      if (exercise) {
        firestore
          .collection(`users/${userID}/exercises`)
          .doc(exercise.exerciseShortcode)
          .update({ userNotes: notes })
        setTimeout(() => {
          setIsSaving(false)
          navigation.goBack()
        }, 200)
      }
      return
    },
    [exercise, notes]
  )

  const setSessionNotes = useCallback(
    (notes) => {
      const readinessDoc = `users/${userID}/readiness/${programID}_${activeDay.week}_${day}`

      if (notesType === "Mindset") {
        firestore.doc(readinessDoc).update({ sessionMindset: notes })
      }
      if (notesType === "Achievements") {
        firestore
          .doc(readinessDoc)
          .update({ "postSessionReview.sessionPositive": notes })
      }
      if (notesType === "Improvements") {
        firestore
          .doc(readinessDoc)
          .update({ "postSessionReview.sessionNegative": notes })
      }

      setTimeout(() => {
        setIsSaving(false)
        navigation.goBack()
      }, 200)
    },
    [notes, notesType, route.params]
  )

  useEffect(() => {
    const didShowSubscription = Keyboard.addListener(
      "keyboardDidShow",
      keyboardDidShow
    )

    return () => didShowSubscription.remove()
  })

  const keyboardDidShow = (e) => {
    const { height } = e.endCoordinates

    setKeyboardHeight(height)
  }
  useEffect(() => {
    inputRef?.current?.focus()
  }, [inputRef])

  const handleNotesSave = useCallback(() => {
    Keyboard.dismiss()
    setIsSaving(true)
    if (notesType === "workout") {
      dispatch(
        postNotes({
          lift: exercise,
          isAccessory: exercise.isAccessory,
          notes,
        })
      )
      setTimeout(() => {
        setIsSaving(false)
        navigation.goBack()
      }, 200)
    }
    if (notesType === "exercise") {
      setExerciseNotes(notes)
    }

    if (["Mindset", "Achievements", "Improvements"].includes(notesType)) {
      setSessionNotes(notes)
    }
  }, [route.params, notes])
  return (
    <Layout level="2" style={{ flex: 1 }}>
      <TextInput
        ref={inputRef}
        multiline
        maxLength={500}
        placeholder="Enter your notes about this exercise..."
        placeholderTextColor={theme['text-hint-color']}
        style={{
          height: "auto",
          color: "white",
          padding: 15,
          fontSize: 20,

          lineHeight: 25,
          marginTop: 15,
          paddingBottom: keyboardHeight - 50,
        }}
        value={notes}
        onChangeText={setNotes}
      />
    </Layout>
  )
}

export default NotesScreen

const styles = StyleSheet.create({})
