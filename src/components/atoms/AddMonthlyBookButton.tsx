import { Button } from '@chakra-ui/react'
import { useState } from 'react'

interface ModalProps {
  setModalFlag: (flag: boolean) => void
}

export const AddMonthlyBookButton: React.FC<ModalProps> = ({ setModalFlag }) => {
  return <Button onClick={() => setModalFlag(true)}>月別の家計簿を追加</Button>
}
