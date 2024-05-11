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
      const changes = snapshot.docChanges().map((change) => change.doc.data() as Book)
      setBooks((prevBooks) => [...prevBooks, ...changes])
    })
    return () => unsubscribe()
  }, [books])
  console.log(books)
  return (
    <>
      <h1>Topだよ！！！</h1>
      <MakeNewBook books={books} setBooks={setBooks} />

      <BookList books={books} setBooks={setBooks} />
    </>
  )
}
