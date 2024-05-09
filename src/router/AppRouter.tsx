import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../components/pages/LoginPage'
import { PrivateRoute } from './PrivateRoute'
import { TopPage } from '../components/pages/TopPage'
import { BookPage } from '../components/pages/BookPage'

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/top" element={<TopPage />} />
        <Route path="/:bookId" element={<BookPage />} />
      </Route>
    </Routes>
  )
}
