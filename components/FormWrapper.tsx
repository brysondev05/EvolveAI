import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SignUpStyles } from '~/styles/SignUpStyle';
import { Layout, useTheme } from '@ui-kitten/components';


export const FormWrapper = ({children, header = null}: any) => {

    const theme = useTheme();

    return (
        <KeyboardAwareScrollView
        style={{ backgroundColor: theme['background-basic-color-1'] }}  contentContainerStyle={{ 
            flexGrow: 1, 
            flexDirection: 'column', 
            justifyContent: 'space-between'
          }}> 
          {header}
      
                    <Layout style={SignUpStyles.innerSwipe}>
                <Layout />
                        {children}
                        
                    </Layout>
        </KeyboardAwareScrollView>
    )
} 
