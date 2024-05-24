import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Stack } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal'
import { useState } from 'react'
import '../../styles/DatePickerStyles.css'
import Flatpickr from 'react-flatpickr'
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index.js'
import 'flatpickr/dist/plugins/monthSelect/style.css'
import 'flatpickr/dist/flatpickr.min.css'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { Button } from '@chakra-ui/react'
import { Alert, AlertTitle, AlertIcon } from '@chakra-ui/alert'

interface ModalProps {
  setModalFlag: (flag: boolean) => void
  modalFlag: boolean
  bookId?: string
}

export const AddMonthlyBookModal: React.FC<ModalProps> = ({ setModalFlag, modalFlag, bookId }) => {
  const [month, setMonth] = useState<string>('')
  const [date, setDate] = useState(new Date())
  const [alertFlag, setAlertFlag] = useState<boolean>(false)

  // MonthSelectPluginの初期化
  const monthSelectOptions = {
    shorthand: true, // 月名を短縮形で表示（例：Jan, Feb）
    dateFormat: 'Y/m', // 出力される日付の形式
  }

  // 日付が選択された時のハンドラー
  const handleDateChange = (selectedDates: Date[]) => {
    // selectedDatesはDateオブジェクトの配列です。
    // 月を2桁の数字で取得します（例: '01', '12'）
    const month = (selectedDates[0].getMonth() + 1).toString().padStart(2, '0')
    const year = selectedDates[0].getFullYear().toString()

    // 年月の形式で日付をセットします（例: '2024/01'）
    setDate(new Date(`${year}-${month}-01`))
    // 月のステートも更新
    setMonth(`${year}/${month}`)
  }

  const addMonthlyBookToFirebase = async (bookId: string) => {
    if (!bookId) {
      return
    }
    const bookRef = doc(db, 'books', bookId) //特定のbookを参照
    const monthlyInfoRef = collection(bookRef, 'monthlyInfo')

    const existingMonthQuery = await getDocs(query(monthlyInfoRef, where('month', '==', date))) //同じ年月の家計簿を探すクエリー

    if (!existingMonthQuery.empty) {
      console.error('既に登録されています。')
      setAlertFlag(true)
      return
    }
    try {
      console.log('月別アーカイブの追加に成功しました')
      await setDoc(doc(monthlyInfoRef), { month: date })
      setAlertFlag(false)
      setModalFlag(false)
      setMonth('')
    } catch {
      console.error('月別の家計簿の登録に失敗しました')
      setAlertFlag(false)
      setModalFlag(false)
      setMonth('')
    }
  }
  return (
    <>
      <Modal isOpen={modalFlag} onClose={() => setModalFlag(false)} autoFocus={false} motionPreset="slideInBottom">
        <ModalOverlay>
          <ModalContent pb={6}>
            <ModalHeader>月別家計簿の登録</ModalHeader>
            <ModalCloseButton />
            <ModalBody mx={4}>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>作成したい家計簿の月を選択してください</FormLabel>

                  <Flatpickr
                    data-enable-time
                    value={month}
                    onChange={handleDateChange}
                    options={{
                      plugins: [new (MonthSelectPlugin as any)(monthSelectOptions)],
                      altInput: true, //Input要素を出力するか
                      altFormat: month,
                      altInputClass: 'chakra-input css-1cjy4zv', // Chakra UIのスタイルクラスを指定
                    }}
                  />
                </FormControl>
                {alertFlag === true ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>既に登録されています！</AlertTitle>
                  </Alert>
                ) : null}
                <Button onClick={() => bookId && addMonthlyBookToFirebase(bookId)}>作成</Button>
              </Stack>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  )
}
