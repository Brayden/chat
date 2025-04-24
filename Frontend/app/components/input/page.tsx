'use client'

import { Input } from '@/app/components/input/Input'
import { Label } from '@/app/components/label/Label'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { useState } from 'react'

export default function Page() {
  const [isValid, setIsValid] = useState(true)

  const checkIfValid = (value: string) => {
    if (value === 'dog' || value === '') {
      setIsValid(true)
    } else setIsValid(false)
  }

  return (
    <Section>
      <Inset>
        <Block title="Input">
          <Label title="Name" htmlFor="name">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. Joe Smith"
              id="name"
              disabled
              size="sm"
            />
          </Label>
          <Label
            title="Resource name"
            htmlFor="resourceName"
            required
            requiredDescription="text must be 'dog' "
            isValid={isValid}
          >
            <Input
              isValid={isValid}
              preText="outerbase.com/"
              onValueChange={checkIfValid}
              placeholder="my-cool-base"
              id="resourceName"
              size="md"
            />
          </Label>
          <Label title="Month" htmlFor="month">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. April"
              id="month"
              size="base"
            />
          </Label>
        </Block>
      </Inset>
    </Section>
  )
}
