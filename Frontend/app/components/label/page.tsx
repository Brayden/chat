'use client'

import { dbs } from '@/app/components/db-card/page'
import { Input } from '@/app/components/input/Input'
import { Label } from '@/app/components/label/Label'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { useState } from 'react'

// docs:
// used with inputs, selects, and other form items
//

export default function Page() {
  const [value, setValue] = useState(dbs[0])

  return (
    <Section>
      <Inset>
        <Block title="Label">
          <Label title="Name" htmlFor="name" className="w-1/2">
            <Input
              onValueChange={() => {}}
              placeholder="e.g. Joe Smith"
              id="name"
            />
          </Label>
        </Block>
      </Inset>
    </Section>
  )
}
