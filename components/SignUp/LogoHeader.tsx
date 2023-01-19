import { StyleSheet } from 'react-native'

import { Layout, Text, useTheme } from '@ui-kitten/components'

import * as Progress from 'react-native-progress'
import { LogoPlaceholder } from '../LogoPlaceholder'

type Props = {
  progress?: number
  description?: string
  noProgress?: boolean
}
export const LogoHeader = ({
  progress = 0,
  description = '',
  noProgress = false,
}: Props) => {
  const theme = useTheme()

  return (
    <Layout>
      <Layout style={styles.logoHeader}>
        <Layout>
          <Layout style={{ width: '100%', marginLeft: 20, marginTop: 10 }}>
            <LogoPlaceholder style={{ marginBottom: 10, marginTop: 10 }} />
            {!noProgress && (
              <Progress.Bar
                useNativeDriver
                color={theme['color-primary-default']}
                progress={progress}
                width={80}
              />
            )}
          </Layout>
        </Layout>
        <Layout style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
          <Text category='h6'>{description}</Text>
        </Layout>
      </Layout>
    </Layout>
  )
}

const styles = StyleSheet.create({
  logoHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
})
