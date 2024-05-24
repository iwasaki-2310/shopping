import { Timestamp } from 'firebase/firestore'
import { atom } from 'recoil'

export interface MonthlyInfoType {
  monthlyId: string
  month: Timestamp
}

export interface bookInfoStateType {
  bookId: string
  bookName: string
  joinedUser: string[]
  monthlyInfo: MonthlyInfoType[]
}

export const bookInfoState = atom<bookInfoStateType>({
  key: 'bookIdState',
  default: {
    bookId: '',
    bookName: '',
    joinedUser: [],
    monthlyInfo: [],
  },
})
