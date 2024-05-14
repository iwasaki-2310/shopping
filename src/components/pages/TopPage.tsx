import { useRecoilState } from 'recoil'
import { MakeNewBook } from '../atoms/MakeNewBook'
import { BookList } from '../organisms/BookList'
import { Book } from '../../types/Book'
import { bookIdState } from '../../state/atoms/bookIdState'
import { useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'

export const TopPage: React.FC = () => {
  const [books, setBooks] = useRecoilState<Book[]>(bookIdState)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          setBooks((prevBooks) => [...prevBooks, { id: change.doc.id, data: change.doc.data() as Book }])
        } else if (change.type === 'modified') {
          setBooks((prevBooks) =>
            prevBooks.map((prevBook) => (prevBook.id === change.doc.id ? change.doc.data() : prevBook)),
          )
        } else if (change.type === 'removed') {
          setBooks((prevBooks) => prevBooks.filter((prevBook) => prevBook.id !== change.doc.id))
        }
      })
      const newBooks = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as Book }))
      setBooks(newBooks)
    })
    return () => unsubscribe()
  }, [])
  return (
    <>
      <h1>Topだよ！！！</h1>
      <MakeNewBook />

      <BookList />
    </>
  )
}
