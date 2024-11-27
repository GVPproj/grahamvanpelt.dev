import Image from 'next/image'

interface Props {
  src: string
  alt: string
}

export default function Laptop(props: Props) {
  return (
    <div>
      <div className="relative mx-auto h-[172px] max-w-[301px] rounded-t-xl border-[8px] border-gray-800 bg-gray-800 md:h-[294px] md:max-w-[512px] dark:border-gray-800">
        <div className="h-[154px] overflow-hidden rounded-lg md:h-[278px]">
          <Image
            src={props.src}
            alt={props.alt}
            className="h-full w-full rounded-xl object-cover"
            width={512}
            height={278}
          />
        </div>
      </div>
      <div className="relative mx-auto h-[17px] max-w-[351px] rounded-b-xl rounded-t-sm bg-gray-900 md:h-[21px] md:max-w-[597px] dark:bg-gray-700">
        <div className="absolute left-1/2 top-0 h-[5px] w-[56px] -translate-x-1/2 rounded-b-xl bg-gray-800 md:h-[8px] md:w-[96px]"></div>
      </div>
    </div>
  )
}
