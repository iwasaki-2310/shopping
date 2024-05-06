import { useParams } from 'react-router-dom'
import { Book } from '../../types/Book'
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { InvitationButton } from '../atoms/InvitationButton'
import { SettingButton } from '../atoms/SettingButton'
import { ToTopButton } from '../atoms/ToTopButton'
import { AddMonthlyBookButton } from '../atoms/AddMonthlyBookButton'
import { AddMonthlyBookModal } from '../organisms/AddMonthlyBookModal'

export const BookPage: React.FC = () => {
  const user = auth.currentUser
  const { bookId } = useParams<{ bookId: string }>()
  const BookRef = bookId && doc(db, 'books', bookId)
  const [bookInfo, setBookInfo] = useState<Book>()
  const [modalFlag, setModalFlag] = useState<boolean>(false)

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
      <AddMonthlyBookButton setModalFlag={setModalFlag} />
      <SettingButton />
      <InvitationButton />
      <ToTopButton />
      <AddMonthlyBookModal modalFlag={modalFlag} setModalFlag={setModalFlag} bookId={bookId} />
    </>
  )
}
