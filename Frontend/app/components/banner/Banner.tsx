import { cn } from '@/app/utils/tw'
import Image from 'next/image'

type BannerProps = {
  children?: React.ReactNode
  className: string
  filter: React.ReactNode
  image: string
}

const Banner = ({ children, className, filter, image }: BannerProps) => {
  return (
    <button
      className="group relative aspect-video w-2/3 cursor-pointer overflow-hidden rounded-lg bg-neutral-800 p-6 shadow-xl after:absolute after:top-0 after:left-0 after:size-full after:rounded-lg after:border-4 after:border-white/20"
      onClick={() => console.log('Here')}
    >
      <div className="dither absolute top-0 left-0 z-10 size-full" />

      {children}

      <div className="absolute top-0 left-0 flex size-full scale-105 items-center">
        {filter}

        <Image
          src={image}
          width={600}
          height={600}
          className={cn('scale-110', className)}
          alt="img"
        />
      </div>
    </button>
  )
}

export default Banner
