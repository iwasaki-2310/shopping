import { useNavigate } from 'react-router-dom'
import { provider, useAuth } from '../providers/GoogleLoginUserProvider'

export const SignInButton: React.FC<{ provider: typeof provider }> = ({ provider }) => {
  const { handleSignIn } = useAuth()
  const navigate = useNavigate()

  const signInWithGoogle = async () => {
    try {
      await handleSignIn()
      navigate('/top')
    } catch (error) {
      console.error('ログインに失敗しました', error)
    }
  }
  return <button onClick={signInWithGoogle}>ログイン</button>
}
