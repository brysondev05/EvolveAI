import { useState, useEffect, useCallback } from 'react'
import { useMMKVObject } from 'react-native-mmkv'

type helpers = {
  overviewExpandedInfo: boolean
}
export const useExpandedNotice = () => {
  const [showExpanded, setShowExpanded] = useState(false)
  const [showExpandedNotice, setShowExpandedNotice] = useState(false)

  const [helpers, setHelpers] = useMMKVObject<helpers>('helpers')
  useEffect(() => {
    let canContinue = true
    if (
      showExpanded &&
      !helpers?.overviewExpandedInfo &&
      !setShowExpandedNotice &&
      canContinue
    ) {
      setShowExpandedNotice(true)
    }
    return () => {
      canContinue = false
    }
  }, [showExpanded, helpers?.overviewExpandedInfo])

  const handlePopupPress = useCallback(() => {
    if (showExpandedNotice) {
      setShowExpandedNotice(false)
    }
    if (!helpers?.overviewExpandedInfo) {
      setHelpers({ ...helpers, overviewExpandedInfo: true })
    }
  }, [helpers])
  const handleShowExpanded = useCallback(() => {
    setShowExpanded((curr) => !curr)
  }, [showExpanded])
  return {
    showExpanded,
    setShowExpanded,
    showExpandedNotice,
    handlePopupPress,
    handleShowExpanded,
    setShowExpandedNotice,
  }
}
