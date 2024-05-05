import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Stack } from '@chakra-ui/layout'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/modal'
import { collection, doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { auth, db } from '../providers/GoogleLoginUserProvider'

export const MakeNewBook: React.FC = () => {
  const user = auth.currentUser
  const [modalFlag, setModalFlag] = useState<boolean>(false)
  const switchDisplayModal = () => setModalFlag(!modalFlag)

  const [bookName, setBookName] = useState<string>('')

  const saveBookInfoToFirestore = async () => {
    if (!bookName.trim()) {
      alert('家計簿の名前を入力してください。')
      return
    }
    const bookRef = doc(collection(db, 'books'))
    try {
      await setDoc(bookRef, { bookName: bookName, joinedUser: user ? [user.uid] : [] })
      alert('家計簿が正常に作成されました。')
      setBookName('')
      setModalFlag(false)
    } catch (error) {
      console.error('家計簿の作成に失敗しました: ', error)
      alert('家計簿の作成に失敗しました。')
    }
  }

  return (
    <>
      <button onClick={switchDisplayModal}>新しい家計簿を作成する</button>
      {modalFlag && (
        <Modal isOpen={modalFlag} onClose={() => setModalFlag(false)} autoFocus={false} motionPreset="slideInBottom">
          <ModalOverlay>
            <ModalContent pb={6}>
              <ModalHeader>家計簿の登録</ModalHeader>
              <ModalCloseButton />
              <ModalBody mx={4}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>家計簿の名前</FormLabel>
                    <Input value={bookName} onChange={(e) => setBookName(e.target.value)} />
                  </FormControl>
                  <button onClick={saveBookInfoToFirestore}>作成</button>
                </Stack>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        </Modal>
      )}
    </>
  )
}
