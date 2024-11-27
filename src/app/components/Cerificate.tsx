'use client'

import JSConfetti from 'js-confetti'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

type CertificateProps = {
  src: string
  alt: string
}

export default function Certificate(props: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<JSConfetti | null>(null)
  const [isCelebrating, setIsCelebrating] = useState(false)

  useEffect(() => {
    // @ts-expect-error - JSConfetti is not typed
    confettiRef.current = new JSConfetti({ canvas: canvasRef.current })
  }, [canvasRef, isCelebrating])

  const handleClick = () => {
    if (!confettiRef.current) return
    setIsCelebrating(true)

    confettiRef.current.addConfetti({
      confettiRadius: 4,
      confettiNumber: 100,
    })
  }

  return (
    <div className="relative">
      {isCelebrating && (
        <canvas className="absolute z-0 h-full w-full" ref={canvasRef} />
      )}
      <button
        className="relative cursor-pointer bg-none"
        onClick={() => {
          handleClick()
          setIsCelebrating(false)
        }}
      >
        <Image
          width={1000}
          height={500}
          src={props.src}
          alt={props.alt}
          title="Celebrate?"
          className="transition duration-300 ease-in-out active:scale-95"
        />
      </button>
    </div>
  )
}
