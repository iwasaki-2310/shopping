import { Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'

export const SettingButton: React.FC = () => {
  const navigate = useNavigate()
  const ROUTES = useRoute()
  return (
    <>
      <Button onClick={() => navigate(ROUTES.setting)}>設定へ移動</Button>
    </>
  )
}
