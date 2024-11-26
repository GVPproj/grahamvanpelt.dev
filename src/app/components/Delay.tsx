import React, { useState, useEffect } from "react"

type Props = {
  children: React.ReactNode
  delayTime?: number
}

/**
 * render children after a pause
 * @param   {number} delayTime  Number of Milliseconds before render (500 default)
 */
const Delay = ({ children, delayTime = 500 }: Props) => {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true)
    }, delayTime)
    return () => clearTimeout(timer)
  }, [delayTime])

  return isShown ? <>{children}</> : null
}

export default Delay
