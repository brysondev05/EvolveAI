import { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Button, Text, Layout } from '@ui-kitten/components'
import { ButtonSwitch } from '~/components/presentational/buttons/ButtonSwitch'

const ReadinessButtonSwitch = ({ title, onChange, value, options, errors }) => {
  const handleChange = useCallback((index) => {
    onChange(index)
  }, [])
  return (
    <Layout
      level='2'
      style={[styles.secondLayout, { borderWidth: errors ? 1 : 0 }]}>
      <Text category='h6' style={styles.cardHeading}>
        {title}
      </Text>
      <ButtonSwitch
        style={{ flex: 1 }}
        onSelect={handleChange}
        selectedIndex={value}>
        {options.map(([num]) => (
          <Button size='small' style={{ flex: 1 }} key={num}>
            {num}
          </Button>
        ))}
      </ButtonSwitch>
      <Text category='c1' style={{ marginVertical: 10, paddingRight: '5%' }}>
        {options[value]?.[1]}
      </Text>
    </Layout>
  )
}

export default ReadinessButtonSwitch

const styles = StyleSheet.create({
  secondLayout: {
    padding: 15,
    marginTop: 15,
    // marginBottom: 25,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    borderColor: 'red',
    elevation: 4,
  },

  cardHeading: {
    marginBottom: 15,
  },
})
