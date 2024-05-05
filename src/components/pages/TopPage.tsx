import { MakeNewBook } from '../atoms/MakeNewBook'
import { BookList } from '../organisms/BookList'

export const TopPage: React.FC = () => {
  return (
    <>
      <h1>Topだよ！！！</h1>
      <MakeNewBook />

      <BookList />
    </>
  )
}
