import { useNavigate, useParams } from 'react-router-dom'
import { Book } from '../../types/Book'
import { useRoute } from '../providers/RouteProviders'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'

export const BookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const ROUTES = useRoute()
  const BookRef = bookId && doc(db, 'books', bookId)
  const [bookInfo, setBookInfo] = useState<Book>()

  useEffect(() => {
    const fetchBook = async () => {
      if (BookRef) {
        const bookSnap = await getDoc(BookRef)
        setBookInfo(bookSnap.data())
      }
    }
    fetchBook()
  }, [bookId])

  return (
    <>
      <h1>{bookInfo && bookInfo.bookName}</h1>
      <p>{bookId}</p>
      <button onClick={() => navigate(ROUTES.top)}>Topに戻る</button>
    </>
  )
}
