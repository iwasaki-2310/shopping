import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './components/providers/GoogleLoginUserProvider'
import { RouteProviders } from './components/providers/RouteProviders'

function App() {
  return (
    <>
      <AuthProvider>
        <RouteProviders>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </RouteProviders>
      </AuthProvider>
    </>
  )
}

export default App
