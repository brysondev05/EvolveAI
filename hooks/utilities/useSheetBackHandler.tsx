import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import { BackHandler } from "react-native"
import { useDispatch } from "react-redux"
import { useTypedSelector } from "~/reduxStore/reducers"

const useSheetBackHandler = () => {
  const infoSheet = useTypedSelector((state) => state.infoSheet)
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (infoSheet?.action === "open_info_sheet") {
          //   disableSelectionMode();
          dispatch({ type: "CLOSE_INFO_SHEET" })
          return true
        }

        return false
      }

      const eventListener = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => eventListener.remove()
    }, [infoSheet])
  )
}

export default useSheetBackHandler
