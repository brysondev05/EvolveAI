import {StyleSheet} from 'react-native';
import {StyleService} from '@ui-kitten/components';


export const SignUpStyles = StyleService.create({

    inputGroup: {
        marginBottom: 10
    },
    innerSwipe: {
        // paddingLeft: 20,
        // paddingRight: 20,
        // paddingTop: 20,
        // flex: 1,
        // justifyContent: "space-between",
        // alignContent: 'flex-end',
        // paddingHorizontal: 20,
        // flexDirection: 'column',
        flexGrow: 1, 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    radioButton: {
        backgroundColor: 'background-basic-color-4', 
        paddingVertical: 20, 
        borderRadius: 10, 
        paddingLeft: 15,
        paddingRight: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4
    },
    checkboxButton: {
        backgroundColor: 'background-basic-color-4', 
        paddingVertical: 20,
        paddingHorizontal: 10, 
        marginVertical: 5, 
        borderRadius: 10, 
       width: '48%',
       shadowColor: "#000",
       shadowOffset: {
           width: 0,
           height: 2,
       },
       shadowOpacity: 0.23,
       shadowRadius: 2.62,

       elevation: 4,
    }
});