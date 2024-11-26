import React, { useState, useEffect } from "react"

interface FadeInProps {
  children: React.ReactElement
}

const FadeIn: React.FC<FadeInProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => setLoaded(true), [])

  return (
    <div
      className={
        "opacity-0 transition-opacity duration-300 ease-in-out " +
        (loaded ? "opacity-100" : "opacity-0")
      }
    >
      {children}
    </div>
  )
}

export default FadeIn
