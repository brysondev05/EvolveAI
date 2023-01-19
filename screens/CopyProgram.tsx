import { useState } from 'react';
import { Button, Input, Layout } from '@ui-kitten/components'
import { View, Text } from 'react-native'
import { useDispatch } from 'react-redux';
import { copyProgram, importToEmulator } from '~/reduxStore/actions/copyProgramActions';
import { useTypedSelector } from '~/reduxStore/reducers';

const CopyProgram = ({navigation}) => {
    const [value, setValue] = useState('');
   const dispatch = useDispatch()
   const userRole = useTypedSelector(({firebase: {profile}}) => profile?.role)

   if(userRole && userRole === 'admin' || __DEV__) {
    return (
        <Layout style={{ flex: 1, paddingTop: 110 }}>
            

            <Input
      placeholder='Users email'
    //   value={value}
      onChangeText={nextValue => setValue(nextValue)}
      style={{ width: '100%' }}
    />
    <Button style={{marginBottom: 15}} onPress={async () => {
      await dispatch(copyProgram({userToCopy: value.trim()}))
      navigation.goBack()
      
      }}>Copy User Program</Button>
    {__DEV__ && (
   <Button onPress={() => dispatch(importToEmulator({userToCopy: value.trim()}))}>Copy to emulator</Button>
    )}
 
    <Button onPress={() => navigation.goBack()}>Back</Button>
        
        </Layout>
    )
   }
    return null
}

export default CopyProgram
