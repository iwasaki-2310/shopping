import { DocumentData, Timestamp, collection, doc, getDocs } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'

interface MonthlyListProps {
  bookId?: string
}

interface MonthlyInfo {
  id: string
  data: DocumentData
}

export const MonthlyList: React.FC<MonthlyListProps> = ({ bookId }) => {
  const [monthlyInfos, setMonthlyInfos] = useState<MonthlyInfo[] | undefined>()
  useEffect(() => {
    const fetchMonthlyInfos = async (bookId: string | undefined) => {
      const bookRef = bookId && doc(db, 'books', bookId)
      const monthlyInfoRef = bookRef && collection(bookRef, 'monthlyInfo')
      const monthlyInfoQuerySnapShot = monthlyInfoRef && (await getDocs(monthlyInfoRef))

      const monthlyInfosFetched: MonthlyInfo[] = monthlyInfoQuerySnapShot
        ? monthlyInfoQuerySnapShot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        : []

      setMonthlyInfos(monthlyInfosFetched)
    }
    if (bookId) {
      // bookIdが存在する場合のみfetchを実行
      fetchMonthlyInfos(bookId)
    }
  }, [bookId])

  return (
    <>
      {monthlyInfos
        ? monthlyInfos.map((info) => (
            <p>
              {info.data.month instanceof Timestamp
                ? new Date(info.data.month.seconds * 1000).toLocaleDateString()
                : info.data.month}
            </p>
          ))
        : '月情報がありません'}
    </>
  )
}
