import { userProfile } from '@/app/lib/user'
import { createContext, useContext, useState } from 'react'

type UserContextType = {
  isSignedIn: boolean
  username: string
  avatar: string
  email: string
  credits: number
  setUserProfile: (profile: {
    isSignedIn: boolean
    username: string
    avatar: string
    email: string
    credits: number
  }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Get initial profile info
  const initialProfile = userProfile()

  const [userProfileData, setUserProfileData] = useState(initialProfile)

  // Update the user profile
  const setUserProfile = (profile: {
    isSignedIn: boolean
    username: string
    avatar: string
    email: string
    credits: number
  }) => {
    setUserProfileData(profile)
  }

  return (
    <UserContext.Provider value={{ ...userProfileData, setUserProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
