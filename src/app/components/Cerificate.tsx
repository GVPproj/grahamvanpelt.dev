// import Confetti from "react-confetti"
import JSConfetti from "js-confetti"
import { useState, useRef, useEffect } from "react"

type CertificateProps = {
  src: string
  alt: string
}

export default function Certificate(props: CertificateProps) {
  const canvasRef = useRef<any>(null)
  const confettiRef = useRef<any>(null)
  const [isCelebrating, setIsCelebrating] = useState(false)

  useEffect(() => {
    confettiRef.current = new JSConfetti({ canvas: canvasRef.current })
  }, [])

  const handleClick = () => {
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
          setIsCelebrating(true)
          setIsCelebrating(false)
        }}
      >
        <img
          width={1000}
          height={500}
          src={props.src}
          alt={props.alt}
          title="Celebrate?"
          className="transition duration-300 ease-in-out active:scale-95"
        ></img>
      </button>
    </div>
  )
}
