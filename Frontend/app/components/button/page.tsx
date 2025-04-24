'use client'

import { Button } from '@/app/components/button/Button'
import { RefreshButton } from '@/app/components/button/RefreshButton'
import { dbs } from '@/app/components/db-card/page'
import { Input } from '@/app/components/input/Input'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { Select } from '@/app/components/select/Select'
import { Database, MagnifyingGlass } from '@phosphor-icons/react'
import { useState } from 'react'

const options = [
  { value: 'Project' },
  { value: 'Organization' },
  { value: 'User' },
]

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [toggled, setToggled] = useState(false)

  const handleToggle = () => {
    setToggled(!toggled)
  }

  const handleClickLoading = () => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const handleClickRefresh = () => {
    setRefreshing(true)

    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  return (
    <Section>
      <Inset>
        <Block title="Button">
          <Button title={'Primary'} size="base" variant="primary" />
          <Button title={'Secondary'} />
          <Button title={'With icon'} loading={loading}>
            <Database />
          </Button>
          <Button
            title={'Small button'}
            size="sm"
            onClick={handleClickLoading}
            loading={loading}
          >
            <Database />
          </Button>
          <Button
            title={'Click to load'}
            onClick={handleClickLoading}
            loading={loading}
          />
          <Button
            title={'Click to toggle'}
            size="base"
            variant="ghost"
            onClick={handleToggle}
            toggled={toggled}
          />
          <Button title={'Destructive'} size="base" variant="destructive" />
        </Block>

        <Block title="Big demo">
          <div className="flex items-end gap-2">
            {/* <Label title="hello">
              <Input onValueChange={undefined} placeholder="hello" size="lg" />
            </Label> */}
            <Input
              onValueChange={undefined}
              placeholder="Search..."
              preText={<MagnifyingGlass className="mr-1" />}
              size="base"
            />
            <Select
              options={options}
              value={dbs[0]}
              setValue={() => console.log('Here')}
              size="base"
            />
            <Button
              title={'Add row'}
              loading={loading}
              onClick={handleClickLoading}
              size="base"
            />

            <RefreshButton
              onClick={handleClickRefresh}
              toggled={refreshing}
              size="base"
            />
          </div>
        </Block>
      </Inset>
    </Section>
  )
}
