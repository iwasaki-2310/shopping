import { useNavigate } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'
import { useState } from 'react'

interface Record {
  date: string
  storeName: string
  price: number
  payment: string
  notes: string
}

export const Table: React.FC = () => {
  const navigate = useNavigate()
  const ROUTES = useRoute()

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
      <button onClick={addRecord}>レコードを追加</button>
      {records.map((record, index) => (
        <>
          <div style={{ display: 'flex' }}>
            {/* 購入日 */}
            <div key={index}>
              <input type="text" placeholder="購入日" value={record.date} onChange={(e) => onChangeDate(e, index)} />
            </div>
            {/* 店名 */}
            <div key={index}>
              <input
                type="text"
                placeholder="店名"
                value={record.storeName}
                onChange={(e) => onChangeStoreName(e, index)}
              />
            </div>
            {/* 金額 */}
            <div key={index}>
              <input type="number" placeholder="金額" value={record.price} onChange={(e) => onChangePrice(e, index)} />
            </div>
            {/* 支払い方法 */}
            <select key={index}>
              <option value="楽天で割り勘">楽天で割り勘</option>
              <option value="楽天でのりこ">楽天でのりこ</option>
              <option value="楽天でしずか">楽天でしずか</option>
            </select>
            {/* 備考 */}
            <div key={index}>
              <input type="text" placeholder="備考" value={record.notes} onChange={(e) => onChangeNotes(e, index)} />
            </div>
            <button key={index} onClick={() => deleteRecord(index)}>
              レコードを削除
            </button>
          </div>
        </>
      ))}
    </>
  )
}
