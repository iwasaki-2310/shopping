import { DocumentData, Timestamp, collection, doc, getDocs } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { bookIdState } from '../../state/atoms/bookIdState'

interface MonthlyListProps {
  bookId?: string
}

interface MonthlyInfo {
  id: string
  data: DocumentData
}

export const MonthlyList: React.FC<MonthlyListProps> = ({ bookId }) => {
  const [monthlyInfos, setMonthlyInfos] = useState<MonthlyInfo[] | undefined>()
  const navigate = useNavigate()

  //Recoil（bookId）
  const AtomBookId = useRecoilValue(bookIdState)
  useEffect(() => {
    const fetchMonthlyInfos = async (AtomBookId: string | undefined) => {
      const bookRef = AtomBookId && doc(db, 'books', AtomBookId)
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
      fetchMonthlyInfos(AtomBookId)
    }
  }, [monthlyInfos])

  return (
    <>
      {monthlyInfos
        ? monthlyInfos.map((info) => (
            <p onClick={() => navigate('')}>
              {info.data.month instanceof Timestamp
                ? new Date(info.data.month.seconds * 1000).toLocaleDateString()
                : info.data.month}
            </p>
          ))
        : '月情報がありません'}
    </>
  )
}
