'use client'

import React from 'react'

const ClickPre: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleCopy = async () => {
    try {
      if (!children) return

      let text = ''
      if (typeof children === 'string' || typeof children === 'number') {
        text = children.toString()
      } else if (React.isValidElement(children)) {
        text = children.props.children.toString()
      }

      await navigator.clipboard.writeText(text)
      alert('Content copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <button onClick={handleCopy} className="w-full">
      <pre className="text-wrap break-words text-left">{children}</pre>
    </button>
  )
}

export default ClickPre
