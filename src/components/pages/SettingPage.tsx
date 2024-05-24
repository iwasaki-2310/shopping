import { useNavigate } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'

export const SettingPage: React.FC = () => {
  const navigate = useNavigate()
  const ROUTES = useRoute()

  return (
    <>
      <p>Settingだよ！！！</p>
      <button onClick={() => navigate(ROUTES.top)}>Topページに戻る</button>
    </>
  )
}
