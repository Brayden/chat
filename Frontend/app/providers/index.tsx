'use client'

import { ModalProvider } from '@/app/providers/ModalProvider'
import { TooltipProvider } from '@/app/providers/TooltipProvider'
import { UserProvider } from '@/app/providers/UserContext'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <TooltipProvider>
        <ModalProvider>{children}</ModalProvider>
      </TooltipProvider>
    </UserProvider>
  )
}
