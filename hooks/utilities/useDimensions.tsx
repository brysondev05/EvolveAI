import { useState, useEffect } from "react"
import { Dimensions } from "react-native"

const window = Dimensions.get("window")
const screen = Dimensions.get("screen")

export const useDimensions = () => {
  const [dimensions, setDimensions] = useState({ window, screen })

  const onChange = ({ window, screen }) => {
    setDimensions({ window, screen })
  }

  useEffect(() => {
    const eventListener = Dimensions.addEventListener("change", onChange)
    return () => {
      eventListener.remove()
    }
  })

  return dimensions
}
