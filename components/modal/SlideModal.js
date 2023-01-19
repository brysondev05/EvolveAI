import React from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';

function SlideModal(props) {
  const { isVisibleModal, children, setModalVisibility } = props;
  return (
    <Modal animationType="slide" transparent visible={isVisibleModal}
      onRequestClose={() => {
        setModalVisibility(false);
      }}>
         {/* <KeyboardAvoidingView
    behavior="position"
    enabled
  > */}
    <KeyboardAvoidingView
    behavior="padding"
    enabled 
    style={styles.centeredView}>
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisibility(false);
            }}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
        <View style={[styles.container, { backgroundColor: 'white' }]}>{children}</View>
      {/* </View> */}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  }
});

export default SlideModal;
