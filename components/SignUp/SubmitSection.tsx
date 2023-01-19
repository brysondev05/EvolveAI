import { useState, useEffect } from 'react'
import { Button, Layout } from '@ui-kitten/components'
import FormControl from '../presentational/FormComponents'
import ThemeColor from '~/constants/color'

export const SubmitSection = ({
  submitting,
  handleSubmit,
  goBack,
  errors = {},
  touched = {},
  submitLabel = 'NEXT',
  showBack = true,
  items = 1,
}: any) => {
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const errorLength = Object.values(errors)?.length
    const touchedLength = Object.values(touched).filter((ho) => ho)?.length

    if (touchedLength === 0 || errorLength > 0) {
      setCanSubmit(false)
    } else if (touchedLength >= items && errorLength === 0) {
      setCanSubmit(true)
    }
  }, [errors, touched])
  return (
    <Layout>
      <Button
        status='secondary'
        appearance={canSubmit ? 'filled' : 'outline'}
        size='large'
        style={{ marginTop: 15, marginBottom: 15 }}
        disabled={submitting}
        onPress={() => handleSubmit()}>
        {submitLabel}
      </Button>

      {showBack && (
        <Button
          style={{
            marginBottom: 15,
          }}
          size='large'
          appearance='outline'
          onPress={() => goBack()}>
          BACK
        </Button>
      )}
    </Layout>
  )
}

export default SubmitSection
