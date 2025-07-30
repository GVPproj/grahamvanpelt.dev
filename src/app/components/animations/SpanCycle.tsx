'use client'

import { useEffect, useState } from 'react'

const toolList = [
  'ReactJS',
  'Accessible UI',
  'Typescript',
  'Graphql',
  'Postgres',
  'TailwindCSS',
  'Astro',
  'Prisma',
  'HTML',
  'Remix',
]

export default function SpanCycle() {
  const [listIdx, setListIdx] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentTool = toolList[listIdx]
    let timeoutId: NodeJS.Timeout

    if (isTyping) {
      // Typing phase
      if (displayText.length < currentTool.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentTool.slice(0, displayText.length + 1))
        }, 100) // 100ms per character
      } else {
        // Hold for 2 seconds then start backspacing
        timeoutId = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
      }
    } else {
      // Backspacing phase
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, 50) // 50ms per backspace (faster)
      } else {
        // Move to next tool
        setIsTyping(true)
        if (listIdx < toolList.length - 1) {
          setListIdx((prev) => prev + 1)
        } else {
          setListIdx(0)
        }
      }
    }

    return () => clearTimeout(timeoutId)
  }, [displayText, isTyping, listIdx])

  return (
    <span className="font-semibold not-italic text-skin-accent">
      {displayText}
      <span
        className="relative inline-block translate-y-[2px] animate-pulse overflow-hidden pl-1 not-italic"
        style={{ height: '0.8em', verticalAlign: 'center' }}
      >
        |
      </span>
    </span>
  )
}
