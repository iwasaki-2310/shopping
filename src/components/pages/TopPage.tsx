import { useNavigate } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'
import { MakeNewBook } from '../atoms/MakeNewBook'
import { BookList } from '../organisms/BookList'

export const TopPage: React.FC = () => {
  const navigate = useNavigate()
  const ROUTES = useRoute()

  return (
    <>
      <h1>Topだよ！！！</h1>
      <MakeNewBook />

      <button onClick={() => navigate(ROUTES.setting)}>設定へ移動</button>

      <BookList />
    </>
  )
}
