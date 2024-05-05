import { collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { Book } from '../../types/Book'
import { useNavigate } from 'react-router-dom'

export const BookList: React.FC = () => {
  const user = auth.currentUser
  const [books, setBooks] = useState<Book[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const booksArray: Book[] = []
      snapshot.forEach((doc) => {
        booksArray.push({ id: doc.id, ...doc.data() })
      })
      setBooks(booksArray)
    })

    return () => unsubscribe()
  }, [])
  return (
    <>
      {books &&
        books.map(
          (book) =>
            book.joinedUser == user?.uid && (
              <button key={book.id} onClick={() => navigate(book.id ? `/${book.id}` : '/')}>
                {book.bookName}
              </button>
            ),
        )}
    </>
  )
}
