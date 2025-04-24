'use client'

import { MenuBar } from '@/app/components/menu-bar/MenuBar'
import Block from '@/app/components/orbit-site/Block'
import Inset from '@/app/components/orbit-site/Inset'
import Section from '@/app/components/orbit-site/Section'
import { BookOpen, Chat, Envelope, Layout } from '@phosphor-icons/react'
import { useState } from 'react'

const items = [
  {
    content: 'All',
    onClick: () => {
      console.log('Sort by All logic')
    },
    id: 0,
  },
  {
    content: 'Bases',
    onClick: () => {
      console.log('Sort by Boards logic')
    },
    id: 1,
  },
  {
    content: 'Boards',
    onClick: () => {
      console.log('Sort by Boards logic')
    },
    id: 2,
  },
]

export default function Page() {
  const [isActive, setIsActive] = useState(0)

  // const handleMenuClick = (id: number) => {
  //   setActive(id)
  // }

  // // Update list to handle ID click + its own onClick
  // const updatedItems = items.map((item) => ({
  //   ...item,
  //   onClick: () => {
  //     handleMenuClick(item.id)
  //     item.onClick()
  //   },
  // }))

  return (
    <Section>
      <Inset>
        <Block title="Menu bar">
          <MenuBar
            options={[
              {
                icon: <Layout />,

                onClick: () => setIsActive(0),
                tooltip: 'Work',
              },
              {
                icon: <BookOpen />,

                onClick: () => setIsActive(1),
                tooltip: 'Blog',
              },
              {
                icon: <Envelope />,

                onClick: () => {
                  setIsActive(2)
                },
                tooltip: 'Contact',
              },

              {
                icon: <Chat />,

                onClick: () => setIsActive(4),
                tooltip: 'Random',
              },
            ]}
            isActive={isActive}
          />
        </Block>
      </Inset>
    </Section>
  )
}
