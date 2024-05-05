import { useNavigate, useParams } from 'react-router-dom'
import { Book } from '../../types/Book'
import { useRoute } from '../providers/RouteProviders'
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/toast'

export const BookPage: React.FC = () => {
  const user = auth.currentUser
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const ROUTES = useRoute()
  const BookRef = bookId && doc(db, 'books', bookId)
  const [bookInfo, setBookInfo] = useState<Book>()
  const [bookName, setBookName] = useState<string>('')

  const toast = useToast()

  const showToast = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      console.log('URLのコピーに成功しました')
    } catch {
      console.error('URLのコピーに失敗しました')
    }
    toast({
      title: 'Info',
      description: '招待リンクをコピーしました！',
      status: 'success',
      duration: 3000,
      position: 'top',
      isClosable: true,
    })
  }

  useEffect(() => {
    const fetchBook = async () => {
      if (BookRef) {
        try {
          await updateDoc(BookRef, { joinedUser: arrayUnion(user?.uid) })
        } catch {
          console.error('ユーザー登録失敗')
        }
        const bookSnap = await getDoc(BookRef)
        setBookInfo(bookSnap.data())
      }
    }
    fetchBook()
  }, [bookId, user])

  return (
    <>
      <h1>{bookInfo && bookInfo.bookName}</h1>
      <p>{bookId}</p>
      <button onClick={() => showToast(location.href)}>招待</button>
      <button onClick={() => navigate(ROUTES.setting)}>設定へ移動</button>
      <button onClick={() => navigate(ROUTES.top)}>Topに戻る</button>
    </>
  )
}
