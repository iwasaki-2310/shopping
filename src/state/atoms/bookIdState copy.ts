import { atom } from 'recoil'

export const bookIdState = atom<{}[]>({
  key: 'bookIdState',
  default: [],
})
