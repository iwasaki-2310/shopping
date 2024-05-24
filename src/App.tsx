import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './components/providers/GoogleLoginUserProvider'
import { RouteProviders } from './components/providers/RouteProviders'
import { RecoilRoot } from 'recoil'

function App() {
  return (
    <>
      <RecoilRoot>
        <AuthProvider>
          <RouteProviders>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </RouteProviders>
        </AuthProvider>
      </RecoilRoot>
    </>
  )
}

export default App
