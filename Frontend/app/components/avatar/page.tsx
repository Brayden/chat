'use client'

import { Avatar } from '@/app/components/avatar/Avatar'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { useState } from 'react'

export default function Page() {
  const [toggle, setToggle] = useState(false)

  const userL = 'logan'
  const userLImg = '/pfp.jpg'

  const userB = 'brandon'

  return (
    <Section>
      <Inset>
        <Block title="Avatar">
          <Avatar username={userL} image={userLImg} size="base" />
          <Avatar username={userB} image={undefined} />
        </Block>
      </Inset>
    </Section>
  )
}
