import { Outlet, useParams } from 'react-router-dom'
import { Book } from '../../types/Book'
import { arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { InvitationButton } from '../atoms/InvitationButton'
import { SettingButton } from '../atoms/SettingButton'
import { ToTopButton } from '../atoms/ToTopButton'
import { AddMonthlyBookButton } from '../atoms/AddMonthlyBookButton'
import { AddMonthlyBookModal } from '../organisms/AddMonthlyBookModal'
import { MonthlyList } from '../organisms/MonthlyList'
import { useRecoilState } from 'recoil'
import { bookInfoState, bookInfoStateType } from '../../state/atoms/bookIdState'

interface MonthlyInfo {
  monthlyId: string
  month: string
}

export const BookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const [recoilBookInfo, setRecoilBookInfo] = useRecoilState<bookInfoStateType>(bookInfoState)
  const user = auth.currentUser

  const BookRef = bookId && doc(db, 'books', bookId)
  const [bookInfo, setBookInfo] = useState<Book>()
  const [modalFlag, setModalFlag] = useState<boolean>(false)

  useEffect(() => {
    const fetchBook = async () => {
      if (BookRef) {
        // Firestoreから月次家計簿リストの取得
        const monthlyInfoRef = collection(BookRef, 'monthlyInfo')
        const monthlyInfoQuerySnapShot = monthlyInfoRef && (await getDocs(monthlyInfoRef))
        const monthlyInfosFetched: MonthlyInfo[] = monthlyInfoQuerySnapShot
          ? monthlyInfoQuerySnapShot.docs.map((doc) => ({
              monthlyId: doc.id,
              month: doc.data().month,
            }))
          : []

        // 変更があればFirestoreの月次家計簿リストを更新
        try {
          await updateDoc(BookRef, { joinedUser: arrayUnion(user?.uid), monthlyInfo: monthlyInfosFetched })
        } catch {
          console.error('ユーザー登録失敗')
        }

        // ローカルステートにFirestoreにある開いている家計簿の全データをオブジェクトとして保存
        const bookSnap = await getDoc(BookRef)
        bookId &&
          setRecoilBookInfo({
            bookId: bookId,
            bookName: bookSnap.data()?.bookName,
            joinedUser: bookSnap.data()?.joinedUser,
            monthlyInfo: bookSnap.data()?.monthlyInfo,
          })

        bookId && console.log(recoilBookInfo)
      }
    }
    fetchBook()
  }, [])

  return (
    <>
      <h1>{recoilBookInfo.bookName}</h1>
      <AddMonthlyBookButton setModalFlag={setModalFlag} />
      <SettingButton />
      <InvitationButton />
      <ToTopButton />
      <AddMonthlyBookModal modalFlag={modalFlag} setModalFlag={setModalFlag} bookId={bookId} />
      <MonthlyList />
    </>
  )
}
