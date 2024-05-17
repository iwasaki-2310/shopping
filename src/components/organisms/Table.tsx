import { useNavigate, useParams } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { bookInfoState, bookInfoStateType } from '../../state/atoms/bookIdState'
import { Button } from '@chakra-ui/react'
import { Timestamp, collection, doc, getDoc } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'

interface Record {
  date: string
  storeName: string
  price: number
  payment: string
  notes: string
}

export const Table: React.FC = () => {
  const { monthlyId } = useParams<{ monthlyId: string }>()
  const [recoilBookInfo, setRecoilBookInfo] = useRecoilState<bookInfoStateType>(bookInfoState)
  const [monthTimestamp, setMonthTimestamp] = useState<Timestamp>()
  const navigate = useNavigate()
  const ROUTES = useRoute()
  const APP_KEY = 'FinanceApp'
  const [storedMonth, setStoredMonth] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonthData = async (bookId: string, monthlyId: string) => {
      if (!bookId || !monthlyId) {
        console.error('必要なIDが提供されていません')
        return
      }
      const bookRef = doc(db, 'books', bookId)
      const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
      const monthlyInfoSnap = await getDoc(monthlyInfoRef)
      if (monthlyInfoSnap.exists()) {
        const timestamp = monthlyInfoSnap.data().month
        setMonthTimestamp(timestamp)
      } else {
        console.error('月のデータが Timestamp 型ではありません')
      }
      // console.log(initialState)
    }
    if (recoilBookInfo.bookId && monthlyId) {
      fetchMonthData(recoilBookInfo.bookId, monthlyId)
    }
  }, [recoilBookInfo.bookId, monthlyId])

  useEffect(() => {
    if (monthTimestamp) {
      const monthString = monthTimestamp.toDate().toLocaleDateString().slice(0, -2)
      setStoredMonth(monthString)
      localStorage.setItem(APP_KEY, monthString)
    }
  }, [monthTimestamp])

  const [records, setRecords] = useState<Record[]>([])

  const addRecord = () => {
    const newRecord: Record = {
      date: '',
      storeName: '',
      price: 0,
      payment: '',
      notes: '',
    }
    setRecords([...records, newRecord])
  }

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRecords = [...records]
    newRecords[index].date = e.target.value
    setRecords(newRecords)
  }
  const onChangeStoreName = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRecords = [...records]
    newRecords[index].storeName = e.target.value
    setRecords(newRecords)
  }
  const onChangePrice = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRecords = [...records]
    newRecords[index].price = parseInt(e.target.value, 10)
    setRecords(newRecords)
  }
  const onChangeNotes = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRecords = [...records]
    newRecords[index].notes = e.target.value
    setRecords(newRecords)
  }
  const deleteRecord = (index: number) => {
    setRecords((prevRecords) => prevRecords.filter((_, i) => i !== index))
  }

  return (
    <>
      <h1>{APP_KEY ? `${localStorage.getItem(APP_KEY)}の月次データ` : 'データ読み込み中'}</h1>
      <Button onClick={() => navigate(-1)}>戻る</Button>
      <Button onClick={addRecord}>レコードを追加</Button>
      {records.map((record, index) => (
        <div key={index} style={{ display: 'flex' }}>
          <div>
            <input type="text" placeholder="購入日" value={record.date} onChange={(e) => onChangeDate(e, index)} />
          </div>
          <div>
            <input
              type="text"
              placeholder="店名"
              value={record.storeName}
              onChange={(e) => onChangeStoreName(e, index)}
            />
          </div>
          <div>
            <input type="number" placeholder="金額" value={record.price} onChange={(e) => onChangePrice(e, index)} />
          </div>
          <select>
            <option value="楽天で割り勘">楽天で割り勘</option>
            <option value="楽天でのりこ">楽天でのりこ</option>
            <option value="楽天でしずか">楽天でしずか</option>
          </select>
          <div>
            <input type="text" placeholder="備考" value={record.notes} onChange={(e) => onChangeNotes(e, index)} />
          </div>
          <Button onClick={() => deleteRecord(index)}>レコードを削除</Button>
        </div>
      ))}
    </>
  )
}
