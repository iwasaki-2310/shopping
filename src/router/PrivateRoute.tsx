import { useEffect } from 'react'
import { useAuth } from '../components/providers/GoogleLoginUserProvider'

import { useAuthState } from 'react-firebase-hooks/auth'
import { Outlet, useNavigate } from 'react-router-dom'

export const PrivateRoute: React.FC = () => {
  const { auth } = useAuth()
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/')
      }
    }
  }, [user, loading, navigate])
  return user ? <Outlet /> : null
}

export default PrivateRoute
