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
      // console.log({ bookRef, monthlyInfoRef })

      if (monthlyInfoSnap.exists()) {
        const timestamp = monthlyInfoSnap.data().month
        setMonthTimestamp(timestamp)
        // console.log('月次データ取得成功', monthlyInfoSnap.data().recordsInfo)

        const recordsInfoRef = collection(monthlyInfoRef, 'recordsInfo')
        // console.log('recordsInfo参照作成', recordsInfoRef)

        // コレクションの内容を取得してログに出力
        const recordsSnapshot = await getDocs(recordsInfoRef)
        // console.log('recordsSnapshot:', recordsSnapshot)
        // console.log('recordsInfoコレクションのドキメント数:', recordsSnapshot.size)
        recordsSnapshot.docs.forEach((doc) => {
          console.log('ドキュメントデータ:', doc.data())
        })

        const unsubscribe = onSnapshot(recordsInfoRef, (snapshot) => {
          // console.log('onSnapshot開始', snapshot)
          // console.log('snapshotのドキュメント数:', snapshot.size)
          snapshot.docChanges().forEach(
            (change) => {
              // console.log('ドキュメント変更検出', change)
              if (change.type === 'added') {
                setRecords((prevRecords) => [...prevRecords, change.doc.data() as Record])
                // console.log('追加しました')
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
        // console.log(recoilBookInfo.bookId)
        // console.log(monthlyId)
        const bookRef = doc(db, 'books', bookId)
        // console.log(bookRef.path)
        const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
        // console.log(monthlyInfoRef.path)
        const recordsRef = collection(monthlyInfoRef, 'records')
        console.log(recordsRef.path)
        const q = query(recordsRef)
        const querySnapshot = await getDocs(q)
        // console.log(querySnapshot)
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

  // console.log(records)

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
        // console.log('Monthly Info Ref:', monthlyInfoRef.path)
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

  // const onChangeDate = (e: React.ChangeEvent<HTMLInputElement>, FieldName: string) => {
  //   setRecords((prevRecords) =>
  //     prevRecords.map((record) => {
  //       if (record.date.dateField === FieldName) {
  //         // console.log(record.date.dateField)
  //         return {
  //           ...record,
  //           date: { ...record.date, dateValue: e.target.value },
  //         }
  //       }
  //       return record
  //     }),
  //   )
  // }

  const onChangeDate = async (e: React.ChangeEvent<HTMLInputElement>, FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.date.dateField === FieldName) {
          // console.log(`フィールド名：${record.date.dateField}`)
          const recordId = record.recordId
          // console.log(`レコードID：${recordId}`)
          const dateValue = e.target.value
          // console.log(`月次ID：${monthlyId}`)
          // console.log(`recoilBookInfo.bookId：${recoilBookInfo.bookId}`)
          const bookRef = doc(db, 'books', bookId)
          // console.log(`bookRef参照：${bookRef}`)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)

            try {
              await updateDoc(recordRef, {
                date: dateValue,
              })
              // setRecords([...records ])
              return { ...record, date: { ...record.date, dateValue } }
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

  const onChangeStoreName = async (e: React.ChangeEvent<HTMLInputElement>, FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.storeName.storeNameField === FieldName) {
          // console.log(`フィールド名：${record.storeName.storeNameField}`)
          const recordId = record.recordId
          // console.log(`レコードID：${recordId}`)
          const storeNameValue = e.target.value
          const storeNameField = record.storeName.storeNameField
          // console.log(`月次ID：${monthlyId}`)
          // console.log(`recoilBookInfo.bookId：${recoilBookInfo.bookId}`)
          const bookRef = doc(db, 'books', bookId)
          // console.log(`bookRef参照：${bookRef}`)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)

            try {
              await updateDoc(recordRef, {
                storeName: { storeNameField: storeNameField, storeNameValue: storeNameValue },
              })
              // setRecords([...records ])
              return { ...record, storeName: { ...record.storeName, storeNameField, storeNameValue } }
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

  const onChangePrice = async (e: React.ChangeEvent<HTMLInputElement>, FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.price.priceField === FieldName) {
          // console.log(`フィールド名：${record.price.priceField}`)
          const recordId = record.recordId
          // console.log(`レコードID：${recordId}`)
          const priceValue = parseFloat(e.target.value)
          const priceField = record.price.priceField
          // console.log(`月次ID：${monthlyId}`)
          // console.log(`recoilBookInfo.bookId：${recoilBookInfo.bookId}`)
          const bookRef = doc(db, 'books', bookId)
          // console.log(`bookRef参照：${bookRef}`)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)

            try {
              await updateDoc(recordRef, {
                price: { priceField: priceField, priceValue: priceValue },
              })
              // setRecords([...records ])
              return { ...record, price: { ...record.price, priceField, priceValue } }
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

  const onChangePayment = async (e: React.ChangeEvent<HTMLSelectElement>, FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.payment.paymentField === FieldName) {
          // console.log(`フィールド名：${record.payment.paymentField}`)
          const recordId = record.recordId
          // console.log(`レコードID：${recordId}`)
          const paymentValue = e.target.value
          const paymentField = record.payment.paymentField
          // console.log(`月次ID：${monthlyId}`)
          // console.log(`recoilBookInfo.bookId：${recoilBookInfo.bookId}`)
          const bookRef = doc(db, 'books', bookId)
          // console.log(`bookRef参照：${bookRef}`)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)

            try {
              await updateDoc(recordRef, {
                payment: { paymentField: paymentField, paymentValue: paymentValue },
              })
              // setRecords([...records ])
              return { ...record, payment: { ...record.payment, paymentField, paymentValue } }
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

  const onChangeNotes = async (e: React.ChangeEvent<HTMLInputElement>, FieldName: string, bookId: string) => {
    const updates = await Promise.all(
      records.map(async (record) => {
        if (record.notes.notesField === FieldName) {
          // console.log(`フィールド名：${record.notes.notesField}`)
          const recordId = record.recordId
          // console.log(`レコードID：${recordId}`)
          const notesValue = e.target.value
          const notesField = record.notes.notesField
          // console.log(`月次ID：${monthlyId}`)
          // console.log(`recoilBookInfo.bookId：${recoilBookInfo.bookId}`)
          const bookRef = doc(db, 'books', bookId)
          // console.log(`bookRef参照：${bookRef}`)
          if (monthlyId) {
            const monthlyInfoRef = doc(bookRef, 'monthlyInfo', monthlyId)
            const recordRef = doc(monthlyInfoRef, 'records', recordId)

            try {
              await updateDoc(recordRef, {
                notes: { notesField: notesField, notesValue: notesValue },
              })
              // setRecords([...records ])
              return { ...record, notes: { ...record.notes, notesField, notesValue } }
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
              onChange={(e) => onChangeDate(e, record.date?.dateField, recoilBookInfo.bookId)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="店名"
              value={record.storeName?.storeNameValue}
              name={record.storeName?.storeNameField}
              onChange={(e) => onChangeStoreName(e, record.storeName?.storeNameField, recoilBookInfo.bookId)}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="金額"
              value={record.price?.priceValue}
              name={record.price?.priceField}
              onChange={(e) => onChangePrice(e, record.price?.priceField, recoilBookInfo.bookId)}
            />
          </div>
          <select
            value={record.payment?.paymentValue}
            name={record.payment?.paymentField}
            onChange={(e) => onChangePayment(e, record.payment?.paymentField, recoilBookInfo.bookId)}
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
              onChange={(e) => onChangeNotes(e, record.notes?.notesField, recoilBookInfo.bookId)}
            />
          </div>

          {/* <Button onClick={() => deleteRecord(index)}>レコードを削除</Button> */}
        </div>
      ))}
    </>
  )
}
