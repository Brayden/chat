'use client'

import DBCard from '@/app/components/db-card/DBCard'
import { Label } from '@/app/components/label/Label'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { Select } from '@/app/components/select/Select'
import { useState } from 'react'

// logic
export const resources = [
  'database',
  'board',
  'Neon',
  'Turso',
  'Cloudflare',
  'RQLite',
  'DigitalOcean',
  'Supabase',
  'Val Town',
  'Starbase',
]

export const dbs = [
  'SQLite',
  'MySQL',
  'Postgres',
  'LibSQL',
  'MongoDB',
  'Clickhouse',
  'BigQuery',
  'Snowflake',
  'MSSql',
  'Redshift',
]

export const colors = ['default', 'orange', 'green', 'blue', 'rainbow']

export const statuses = ['default', 'hasViewers', 'disconnected']

export default function Page() {
  const [resourceType, setResourceType] = useState(resources[0])
  const [db, setDb] = useState(dbs[0])
  const [color, setColor] = useState(colors[0])
  const [status, setStatus] = useState(statuses[0])

  return (
    <Section>
      <Inset>
        <Block title="Base card">
          <DBCard
            title="Snazzy Dolphin or smthn"
            resourceType={resourceType}
            db={db}
            color={color}
            status={status}
            href="/"
          />
          <DBCard
            title="Snazzy Dolphin"
            resourceType={resourceType}
            db={db}
            color={color}
            status={status}
            href="/"
          />
        </Block>

        <section className="w-full">
          <div className="flex gap-4">
            <Label title="Resource type">
              <Select
                options={resources}
                value={resourceType}
                setValue={(value) => setResourceType(value)}
              />
            </Label>

            <Label title="Databases">
              <Select
                options={dbs}
                value={db}
                setValue={(value) => setDb(value)}
              />
            </Label>

            <Label title="Color">
              <Select
                options={colors}
                value={color}
                setValue={(value) => setColor(value)}
              />
            </Label>

            <Label title="Status">
              <Select
                options={statuses}
                value={status}
                setValue={(value) => setStatus(value)}
              />
            </Label>
          </div>
        </section>
      </Inset>
    </Section>
  )
}
