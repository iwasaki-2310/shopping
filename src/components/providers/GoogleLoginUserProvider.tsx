import { initializeApp } from 'firebase/app'
import { Auth, User, getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { DocumentData, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const firebaseConfig = {
  apiKey: 'AIzaSyAUa8ZmdbdGCxWkT0fPV022HJBDKJqXsmM',
  authDomain: 'shopping-4e705.firebaseapp.com',
  projectId: 'shopping-4e705',
  storageBucket: 'shopping-4e705.appspot.com',
  messagingSenderId: '66498473414',
  appId: '1:66498473414:web:3fc01c72011b0ff4d656c7',
  measurementId: 'G-DSWMNNME6P',
}

// FireBaseのインスタンス化
const app = initializeApp(firebaseConfig)

// Firebaseのインスタンスを使用してFirestoreへのインスタンスを取得
const db = getFirestore(app)

// authオブジェクトとプロバイダーの作成
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

// Contextの型定義
interface AuthContextType {
  db: any
  auth: Auth
  provider: GoogleAuthProvider
  signInResult: any
  setSignInResult: (result: any) => void
  userName: string // ユーザー名
  setUserName: (name: string) => void // ユーザー名を更新する関数
  userAvatar: string // ユーザーアバターのURL
  setUserAvatar: (avatar: string) => void // ユーザーアバターを更新する関数
  handleSignIn: () => Promise<void>
  setUserDetails: (userDetails: any) => void
  userDetails: DocumentData | null
}

// AuthContextの作成
const AuthContext = createContext<AuthContextType>({
  db,
  auth,
  provider,
  signInResult: null,
  setSignInResult: () => {},
  userName: '', // userNameを直接含める
  userAvatar: '', // userAvatarを直接含める
  setUserDetails: () => {},
  userDetails: null,
  setUserName: () => {},
  setUserAvatar: () => {},
  handleSignIn: async () => {},
})

// AuthProviderコンポーネントのProps型定義
interface AuthProviderProps {
  children: ReactNode
}

// AuthProviderコンポーネント作成
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userDetails, setUserDetails] = useState<DocumentData | null>(null)
  const [signInResult, setSignInResult] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userName, setUserName] = useState<string>('')
  // ユーザー情報の状態と更新関数を定義
  const [userInfo, setUserInfo] = useState({
    userName: '',
    userAvatar: '',
  })

  // ======================================================
  // 関数名: useEffect
  // 概要: ユーザの情報をリアルタイムで監視し変更があった場合に、ユーザー情報を更新する
  // ======================================================
  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid) // Firestoreからユーザー情報の参照を作成
        const userSnap = await getDoc(userRef) //参照を元にユーザー情報を取得する
        if (userSnap.exists()) {
          //ユーザー情報がみつかれば、そのユーザー情報をuserDetailsに格納する
          setUserDetails(userSnap.data())
        } else {
          setUserDetails(null)
        }
      }
    })
  }, [])

  // ======================================================
  // 関数名: saveUserInfoToFirestore
  // 概要:Google認証がされた際に呼び出される関数。Google認証情報のユーザー情報を元にユーザー情報をFirestoreに格納する
  // ======================================================
  const saveUserInfoToFirestore = async (user: User) => {
    const userRef = doc(db, 'users', user.uid)
    await setDoc(
      userRef,
      {
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      },
      { merge: true },
    )
  }

  // ======================================================
  // 関数名: handleSignIn
  // 概要: サインイン時に、Google認証情報の中からユーザー情報のみを参照してFirestoreに保存、ローカルステートの更新を行う
  // ======================================================
  const handleSignIn = async () => {
    try {
      //ユーザーの認証情報取得して、その認証情報をローカル変数signInResultに格納
      const result = await signInWithPopup(auth, provider)
      setSignInResult(result)

      // サインインしたら、認証情報の中のユーザー情報のみを関数saveUserInfoToFirestoreに渡して、Firestoreに情報を格納する
      await saveUserInfoToFirestore(result.user)
      setUserInfo({
        // ユーザー情報の状態をローカルステートとして更新
        userName: result.user.displayName || '',
        userAvatar: result.user.photoURL || '',
      })
    } catch (error) {
      console.error('ログインに失敗しました', error)
      console.log(provider)
    }
  }
  return (
    <AuthContext.Provider
      value={{
        db,
        auth,
        provider,
        signInResult,
        setSignInResult,
        setUserName,
        ...userInfo,
        setUserAvatar: (avatar: string) => setUserInfo({ ...userInfo, userAvatar: avatar }),
        handleSignIn,
        setUserDetails,
        userDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export const useAuth = (): AuthContextType => useContext(AuthContext)

export { db, auth, provider }
