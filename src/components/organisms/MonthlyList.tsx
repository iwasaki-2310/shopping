import { DocumentData, Timestamp, collection, doc, getDocs } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { bookIdState } from '../../state/atoms/bookIdState'
import { Button } from '@chakra-ui/react'

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
    fetchMonthlyInfos(bookId)
  }, [])

  return (
    <>
      {monthlyInfos
        ? monthlyInfos.map((info) => (
            <Button key={info.id} onClick={() => navigate('')}>
              {info.data.month instanceof Timestamp
                ? new Date(info.data.month.seconds * 1000).toLocaleDateString().slice(0, -2)
                : info.data.month}
            </Button>
          ))
        : '月情報がありません'}
    </>
  )
}
