import { Linking } from 'react-native'
import { Layout } from '@ui-kitten/components'
import GradientHeader from '~/components/presentational/GradientHeader'
import MenuItem from '~/components/presentational/MenuItem'

const mainSettings = [
  {
    heading: 'Change Email',
    subheading: '',
    linkTo: 'Email',
  },
  {
    heading: 'Change Password',
    subheading: '',
    linkTo: 'Password',
  },
  //Disabling Manage Subscription section for now as suggested by Rhea on 03-Nov-22
  // {
  //   heading: 'Manage Subscription',
  //   subheading: '',
  //   linkTo: 'Subscription Settings',
  // },
  {
    heading: 'Privacy Policy',
    linkTo: 'privacy',
    action: () => Linking.openURL('https://www.evolveai.app/privacy-policy'),
  },
  {
    heading: 'Terms & Conditions',
    subheading: '',
    linkTo: 'terms',
    action: () => Linking.openURL('https://www.evolveai.app/terms-of-use'),
  },
]
export default function AccountSettings({ navigation }) {
  return (
    <Layout style={{ flex: 1 }}>
      <GradientHeader title='Account Settings' />
      {mainSettings.map((item) => (
        <MenuItem
          heading={item.heading}
          subheading={item.subheading}
          linkTo={item.linkTo}
          key={item.heading}
          navigation={navigation}
          action={item.action}
        />
      ))}
    </Layout>
  )
}
