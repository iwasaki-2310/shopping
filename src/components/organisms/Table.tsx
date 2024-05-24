import { useNavigate, useParams } from 'react-router-dom'
import { useRoute } from '../providers/RouteProviders'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { bookInfoState, bookInfoStateType } from '../../state/atoms/bookIdState'
import { Button } from '@chakra-ui/react'
import {
  QuerySnapshot,
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { FirebaseError } from 'firebase/app'

interface Record {
  recordId: string
  date: { dateField: string; dateValue: string }
  storeName: { storeNameField: string; storeNameValue: string }
  price: { priceField: string; priceValue: number }
  payment: { paymentField: string; paymentValue: string }
  notes: { notesField: string; notesValue: string }
}

export const Table: React.FC = () => {
  const LOCALSTRAGE_appKEY = 'FinanceApp'
  const LOCALSTRAGE_recoilBookInfoBookId = 'bookId'
  const { monthlyId } = useParams<{ monthlyId: string }>()
  const [recoilBookInfo, setRecoilBookInfo] = useRecoilState<bookInfoStateType>(bookInfoState)
  const [monthTimestamp, setMonthTimestamp] = useState<Timestamp>()
  const navigate = useNavigate()
  const ROUTES = useRoute()
  const [storedMonth, setStoredMonth] = useState<string | null>(null)
  const [records, setRecords] = useState<Record[]>([])

  // ローカルストレージからRecoilの状態を復元
  useEffect(() => {
    const savedBookId = localStorage.getItem(LOCALSTRAGE_recoilBookInfoBookId)
    if (savedBookId) {
      setRecoilBookInfo((prev) => ({ ...prev, bookId: savedBookId }))
    }
  }, [setRecoilBookInfo])

  // bookIdを変更する際にローカルストレージに保存
  useEffect(() => {
    if (recoilBookInfo.bookId) {
      localStorage.setItem(LOCALSTRAGE_recoilBookInfoBookId, recoilBookInfo.bookId)
    }
  }, [recoilBookInfo.bookId])

  // 月次タイムスタンプをFirestoreから取得
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

        const recordsInfoRef = collection(monthlyInfoRef, 'recordsInfo')

        // コレクションの内容を取得してログに出力
        const recordsSnapshot = await getDocs(recordsInfoRef)

        recordsSnapshot.docs.forEach((doc) => {
          console.log('ドキュメントデータ:', doc.data())
        })

        const unsubscribe = onSnapshot(recordsInfoRef, (snapshot) => {
          snapshot.docChanges().forEach(
            (change) => {
              if (change.type === 'added') {
                setRecords((prevRecords) => [...prevRecords, change.doc.data() as Record])
              } else if (change.type === 'modified') {
                setRecords((prevRecords) =>
                  prevRecords.map((prevRecord) =>
                    prevRecord.recordId === change.doc.id ? (change.doc.data() as Record) : prevRecord,
                  ),
                )
              } else if (change.type === 'removed') {
                setRecords((prevRecords) => prevRecords.filter((prevRecord) => prevRecord.recordId !== change.doc.id))
              }
            },
            (error: FirebaseError) => {
              console.error('onSnapshotエラー:', error)
            },
          )
        })
        return () => unsubscribe()
      } else {
        console.error('月のデータが Timestamp 型ではありません')
      }
    }
    if (recoilBookInfo.bookId && monthlyId) {
      fetchMonthData(recoilBookInfo.bookId, monthlyId)
    }
  }, [recoilBookInfo.bookId, monthlyId])

  // マウント時にレコード取得
  useEffect(() => {
    const fetchRecordsData = async (bookId: string) => {
      let fetchedRecords: Record[] = []
      if (bookId && monthlyId) {
        const bookRef = doc(db, 'books', bookId)

        const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)

        const recordsRef = collection(monthlyInfoRef, 'records')
        console.log(recordsRef.path)
        const q = query(recordsRef)
        const querySnapshot = await getDocs(q)

        fetchedRecords = querySnapshot.docs.map((doc) => ({
          recordId: doc.id,
          date: doc.data().date,
          storeName: doc.data().storeName,
          price: doc.data().price,
          payment: doc.data().payment,
          notes: doc.data().notes,
        }))
      }
      setRecords(fetchedRecords)
      console.log(fetchedRecords)
    }
    fetchRecordsData(recoilBookInfo.bookId)
  }, [recoilBookInfo.bookId])

  // 月次タイムスタンプをローカルストレージに��新
  useEffect(() => {
    if (monthTimestamp) {
      const monthString = monthTimestamp.toDate().toLocaleDateString().slice(0, -2)
      setStoredMonth(monthString)
      localStorage.setItem(LOCALSTRAGE_appKEY, monthString)
    }
  }, [monthTimestamp])

  const addRecord = async (bookId: string) => {
    try {
      // Firestoreに新しいレコードを追加
      console.log(bookId)
      if (!bookId || !monthlyId) {
        console.error('必要なIDが提供されていません')
        return
      }
      const bookRef = doc(db, 'books', bookId)
      if (monthlyId) {
        const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)

        const recordsRef = collection(monthlyInfoRef, 'records')
        console.log('Records Ref:', recordsRef.path)

        const newRecordRef = doc(recordsRef) // 新しいレコードの参照を作成
        await setDoc(newRecordRef, {}) // Firestoreに空のドキュメントを追加

        // ローカルの状態を更新
        const newRecordId = newRecordRef.id // 自動生成されたドキュメントIDを取得
        const newRecord: Record = {
          recordId: newRecordId,
          date: { dateField: newRecordId + 'date', dateValue: '' },
          storeName: { storeNameField: newRecordId + 'storeName', storeNameValue: '' },
          price: { priceField: newRecordId + 'price', priceValue: 0 },
          payment: { paymentField: newRecordId + 'payment', paymentValue: '' },
          notes: { notesField: newRecordId + 'notes', notesValue: '' },
        }
        setRecords([...records, newRecord])
      }
    } catch (error) {
      console.error('Error adding document: ', error)
    }
  }

  const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>, FieldName: string) => {
    const newdateValue = e.target.value
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.date && record.date.dateField === FieldName
          ? { ...record, date: { ...record.date, dateValue: newdateValue } }
          : record,
      ),
    )
  }

  const onBlurDate = async (FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.date && record.date.dateField === FieldName) {
          const recordId = record.recordId
          const dateValue = record.date.dateValue
          const dateField = record.date.dateField
          const bookRef = doc(db, 'books', bookId)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)
            try {
              await updateDoc(recordRef, {
                date: { dateField, dateValue },
              })
            } catch (error) {
              console.error('Firestoreへのdateの更新に失敗しました', error)
            }
          }
        }
        return record
      }),
    )
    setRecords(updates)
  }

  const onChangeStoreName = (e: React.ChangeEvent<HTMLInputElement>, FieldName: string) => {
    const newStoreNameValue = e.target.value
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.storeName && record.storeName.storeNameField === FieldName
          ? { ...record, storeName: { ...record.storeName, storeNameValue: newStoreNameValue } }
          : record,
      ),
    )
  }

  const onBlurStoreName = async (FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.storeName && record.storeName.storeNameField === FieldName) {
          const recordId = record.recordId
          const storeNameValue = record.storeName.storeNameValue
          const storeNameField = record.storeName.storeNameField
          const bookRef = doc(db, 'books', bookId)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)
            try {
              await updateDoc(recordRef, {
                storeName: { storeNameField, storeNameValue },
              })
            } catch (error) {
              console.error('FirestoreへのstoreNameの更新に失敗しました', error)
            }
          }
        }
        return record
      }),
    )
    setRecords(updates)
  }

  const onChangePrice = (e: React.ChangeEvent<HTMLInputElement>, FieldName: string) => {
    const newpriceValue = parseFloat(e.target.value)
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.price && record.price.priceField === FieldName
          ? { ...record, price: { ...record.price, priceValue: newpriceValue } }
          : record,
      ),
    )
  }

  const onBlurPrice = async (FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.price && record.price.priceField === FieldName) {
          const recordId = record.recordId
          const priceValue = record.price.priceValue
          const priceField = record.price.priceField
          const bookRef = doc(db, 'books', bookId)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)
            try {
              await updateDoc(recordRef, {
                price: { priceField, priceValue },
              })
            } catch (error) {
              console.error('Firestoreへのpriceの更新に失敗しました', error)
            }
          }
        }
        return record
      }),
    )
    setRecords(updates)
  }

  const onChangePayment = (e: React.ChangeEvent<HTMLSelectElement>, FieldName: string) => {
    const newpaymentValue = e.target.value
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.payment && record.payment.paymentField === FieldName
          ? { ...record, payment: { ...record.payment, paymentValue: newpaymentValue } }
          : record,
      ),
    )
  }

  const onBlurPayment = async (FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.payment && record.payment.paymentField === FieldName) {
          const recordId = record.recordId
          const paymentValue = record.payment.paymentValue
          const paymentField = record.payment.paymentField
          const bookRef = doc(db, 'books', bookId)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)
            try {
              await updateDoc(recordRef, {
                payment: { paymentField, paymentValue },
              })
            } catch (error) {
              console.error('Firestoreへのpaymentの更新に失敗しました', error)
            }
          }
        }
        return record
      }),
    )
    setRecords(updates)
  }

  const onChangeNotes = (e: React.ChangeEvent<HTMLInputElement>, FieldName: string) => {
    const newnotesValue = e.target.value
    setRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.notes && record.notes.notesField === FieldName
          ? { ...record, notes: { ...record.notes, notesValue: newnotesValue } }
          : record,
      ),
    )
  }

  const onBlurNotes = async (FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.notes && record.notes.notesField === FieldName) {
          const recordId = record.recordId
          const notesValue = record.notes.notesValue
          const notesField = record.notes.notesField
          const bookRef = doc(db, 'books', bookId)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)
            try {
              await updateDoc(recordRef, {
                notes: { notesField, notesValue },
              })
            } catch (error) {
              console.error('Firestoreへのnotesの更新に失敗しました', error)
            }
          }
        }
        return record
      }),
    )
    setRecords(updates)
  }

  return (
    <>
      <h1>{LOCALSTRAGE_appKEY ? `${localStorage.getItem(LOCALSTRAGE_appKEY)}の月次データ` : 'データ読み込み中'}</h1>
      <Button onClick={() => navigate(-1)}>戻る</Button>
      <Button onClick={() => addRecord(recoilBookInfo.bookId)}>レコードを追加</Button>
      {records.map((record, index) => (
        <div key={index} style={{ display: 'flex' }}>
          <div>
            <input
              type="text"
              placeholder="購入日"
              value={record.date?.dateValue}
              name={record.date?.dateField}
              onChange={(e) => onChangeDate(e, record.date?.dateField)}
              onBlur={() => onBlurDate(record.date?.dateField, recoilBookInfo.bookId)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="店名"
              value={record.storeName?.storeNameValue}
              name={record.storeName?.storeNameField}
              onChange={(e) => onChangeStoreName(e, record.storeName?.storeNameField)}
              onBlur={() => onBlurStoreName(record.storeName?.storeNameField, recoilBookInfo.bookId)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="金額"
              value={record.price?.priceValue}
              name={record.price?.priceField}
              onChange={(e) => onChangePrice(e, record.price?.priceField)}
              onBlur={() => onBlurPrice(record.price?.priceField, recoilBookInfo.bookId)}
            />
          </div>
          <select
            value={record.payment?.paymentValue}
            name={record.payment?.paymentField}
            onChange={(e) => onChangePayment(e, record.payment?.paymentField)}
            onBlur={() => onBlurPayment(record.payment?.paymentField, recoilBookInfo.bookId)}
          >
            <option value="楽天で割り勘">楽天で割り勘</option>
            <option value="楽天のりこ">楽天でのりこ</option>
            <option value="楽天でしずか">楽天でしずか</option>
          </select>
          <div>
            <input
              type="text"
              placeholder="備考"
              value={record.notes?.notesValue}
              name={record.notes?.notesField}
              onChange={(e) => onChangeNotes(e, record.notes?.notesField)}
              onBlur={() => onBlurNotes(record.notes?.notesField, recoilBookInfo.bookId)}
            />
          </div>

          {/* <Button onClick={() => deleteRecord(index)}>レコードを削除</Button> */}
        </div>
      ))}
    </>
  )
}
