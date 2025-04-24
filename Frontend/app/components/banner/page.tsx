'use client'

import Banner from '@/app/components/banner/Banner'
import RippleFilter from '@/app/components/banner/RippleFilter'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import Image from 'next/image'

export default function Page() {
  return (
    <Section>
      <Inset>
        <Block title="Pixel filter">
          <Banner
            image={'/interface-1.jpg'}
            // filter={<PixelFilter />}
            filter={<RippleFilter />}
            className="ripple"
          />
        </Block>

        <Block title="Ripple filter">
          <Banner
            image={'/clouds.jpg'}
            filter={<RippleFilter />}
            className="ripple"
          >
            <div className="ease-bounce absolute right-10 bottom-10 z-10 transition-transform duration-300 group-hover:-translate-3 group-hover:scale-105">
              <Image
                src={'/sat.png'}
                width={100}
                height={100}
                className="float"
                alt="img"
              />
            </div>
          </Banner>
        </Block>
      </Inset>
    </Section>
  )
}
