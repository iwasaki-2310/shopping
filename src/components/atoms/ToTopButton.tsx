import { Button } from '@chakra-ui/react'
import { useRoute } from '../providers/RouteProviders'
import { useNavigate } from 'react-router-dom'

export const ToTopButton: React.FC = () => {
  const navigate = useNavigate()
  const ROUTES = useRoute()
  return (
    <>
      <Button onClick={() => navigate(ROUTES.top)}>Topに戻る</Button>
    </>
  )
}
