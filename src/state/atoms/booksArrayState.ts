import { atom } from 'recoil'

export const booksArrayState = atom<{}[]>({
  key: 'booksArrayState',
  default: [],
})
