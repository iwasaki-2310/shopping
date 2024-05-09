import { collection, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { Book } from '../../types/Book'
import { useNavigate } from 'react-router-dom'
import { Button } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { bookIdState } from '../../state/atoms/bookIdState'

export const BookList: React.FC = () => {
  const user = auth.currentUser
  const [books, setBooks] = useRecoilState<Book[]>(bookIdState)
  const navigate = useNavigate()

  useEffect(() => {
    if (books.length === 0) {
      // 本のリストが空の場合のみデータを取得
      const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const bookData = change.doc.data() as Book
          if (change.type === 'added') {
            setBooks((prebBooks) => [...prebBooks, { id: change.doc.id, ...bookData }])
          } else if (change.type === 'modified') {
            setBooks((prevBooks) =>
              prevBooks.map((book) => (change.doc.id === change.doc.id ? { id: change.doc.id, ...bookData } : book)),
            )
          } else if (change.type === 'removed') {
            setBooks((prevBooks) => prevBooks.filter((book) => book.id !== change.doc.id))
          }
        })
      })

      return () => unsubscribe()
    }
  }, [books])
  return (
    <>
      {books &&
        books.map(
          (book) =>
            book.joinedUser.includes(user?.uid) && (
              <Button key={book.id} onClick={() => navigate(book.id ? `/${book.id}` : '/')}>
                {book.bookName}
              </Button>
            ),
        )}
    </>
  )
}
