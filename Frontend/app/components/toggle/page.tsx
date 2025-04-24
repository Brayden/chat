'use client'

// import { Button } from '@/app/components/button/Button'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { Toggle } from '@/app/components/toggle/Toggle'
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
          <div className="flex items-center gap-4">
            {/* <Button title="add" /> */}
            <Toggle onClick={handleToggleClick} toggled={toggle} size="sm" />
            <Toggle onClick={handleToggleClick} toggled={toggle} size="base" />
            <Toggle onClick={handleToggleClick} toggled={toggle} size="lg" />
          </div>
        </Block>
      </Inset>
    </Section>
  )
}
