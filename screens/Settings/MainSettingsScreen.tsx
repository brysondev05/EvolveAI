import { View, Text } from 'react-native'
import { Layout } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import MenuItem from '~/components/presentational/MenuItem'


const mainSettings = [
    {
        heading: 'My Program',
        subheading: 'Modify your program',
        linkTo: 'ProgramSettings'
    },
    {
        heading: 'My Account',
        subheading: 'Change your login details',
        linkTo: 'AccountSettings' 
    },
    {
        heading: 'My Profile',
        subheading: 'Change your profile',
        linkTo: 'ProfileSettings'  
    }
]
export default function MainSettingsScreen({navigation}) {
    return (
        <Layout style={{ flex:1 }}>
                          <GradientHeader title="Settings" />
        {mainSettings.map(item => <MenuItem heading={item.heading} subheading={item.subheading} linkTo={item.linkTo} key={item.heading} navigation={navigation} />)}
        <Text></Text>
    </Layout>
    )
}
