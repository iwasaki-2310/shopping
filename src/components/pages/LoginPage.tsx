import { SignInButton } from '../atoms/SignInButton'
import { provider } from '../providers/GoogleLoginUserProvider'

export const LoginPage: React.FC = () => {
  return (
    <>
      <SignInButton provider={provider} />
    </>
  )
}
