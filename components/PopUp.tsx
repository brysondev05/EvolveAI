import { memo } from 'react';
import {StyleSheet} from 'react-native'
import { Modal, Card, Text, Button } from '@ui-kitten/components'

const PopUpContent = ({ visible = false, showModal, title = '', description = '', onPress }) => {

  const backDropPress = () => showModal(false)
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backDrop}
      onBackdropPress={backDropPress}

    >
      <Card style={styles.cardStyle} disabled={true}>
        <Text category="h5">{title}</Text>
        <Text>{description}</Text>
        <Button style={styles.buttonStyle} onPress={onPress}>
          OK
          </Button>
      </Card>
    </Modal>
  )
}
PopUpContent.whyDidYouRender = true
export default memo(PopUpContent)

const styles = StyleSheet.create({
  backDrop: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
  cardStyle: { padding: 5, marginHorizontal: 15 },
  buttonStyle: { marginTop: 20}

})
