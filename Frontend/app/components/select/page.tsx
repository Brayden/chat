'use client'

import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { Select } from '@/app/components/select/Select'
import { useState } from 'react'

const options = [
  { value: 'Project' },
  { value: 'Organization' },
  { value: 'User' },
]

export default function Page() {
  const [value, setValue] = useState(options[0].value)

  return (
    <Section>
      <Inset>
        <Block title="Select">
          <Select
            options={options}
            setValue={(value) => setValue(value)}
            value={value}
            size="sm"
          />
          <Select
            options={options}
            setValue={(value) => setValue(value)}
            value={value}
            size="md"
          />
          <Select
            options={options}
            setValue={(value) => setValue(value)}
            value={value}
          />
        </Block>
      </Inset>
    </Section>
  )
}
