'use client'

import { Card } from '@/app/components/card/Card'
// import { Button } from '@/app/components/button/Button'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { useState } from 'react'

export default function Page() {
  const [toggle, setToggle] = useState(false)

  const handleToggleClick = () => {
    setToggle(!toggle)
  }

  return (
    <Section>
      <Inset>
        <Block title="Toggle">
          <Card>Hello</Card>
        </Block>
      </Inset>
    </Section>
  )
}
