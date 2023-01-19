import { useState } from 'react';
import { Button, Card, Input, Modal, Text } from '@ui-kitten/components'
import { useDimensions } from '~/hooks/utilities/useDimensions'

const ModalInput = ({ notes, setExerciseNotes }) => {
  const [value, setValue] = useState(notes)

  return (
    <>
      <Input
        multiline={true}
        textStyle={{ minHeight: 64 }}
        style={{ marginTop: 5 }}
        // onChangeText={newNotes => setModalNotes(newNotes)}
        placeholder='Enter Notes'
        value={value}
        maxLength={500}
        autoFocus
        onChangeText={(newNotes) => setValue(newNotes)}
      />
      <Button style={{ marginTop: 15 }} onPress={() => setExerciseNotes(value)}>
        OK
      </Button>
    </>
  )
}
export const NotesModal = ({
  notes,
  notesModalVisible,
  showNotesModal,
  setExerciseNotes,
}) => {
  const dimensions = useDimensions()
  return (
    <Modal
      visible={notesModalVisible}
      backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onBackdropPress={() => showNotesModal(false)}>
      <Card
        style={{ padding: 0, width: dimensions.screen.width - 15, bottom: 100 }}
        disabled={true}>
        <Text category='h5'>Notes</Text>
        <ModalInput notes={notes} setExerciseNotes={setExerciseNotes} />
      </Card>
    </Modal>
  )
}
