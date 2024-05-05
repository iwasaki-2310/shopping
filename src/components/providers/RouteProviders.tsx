import { createContext, useContext } from 'react'
import { ROUTES } from '../../constants/routes'

const RouteContext = createContext(ROUTES)

export const RouteProviders: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <RouteContext.Provider value={ROUTES}>{children}</RouteContext.Provider>
}

export const useRoute = () => useContext(RouteContext)
