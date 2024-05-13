import { collection, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { Book } from '../../types/Book'
import { useNavigate } from 'react-router-dom'
import { Button, Heading } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { bookIdState } from '../../state/atoms/bookIdState'

export const BookList: React.FC = () => {
  const user = auth.currentUser
  const [books, setBooks] = useRecoilState<Book[]>(bookIdState)
  const navigate = useNavigate()

  return (
    <>
      <Heading>家計簿の一覧</Heading>
      {books &&
        books.map(
          (book) =>
            book.joinedUser.includes(user?.uid) && (
              <Button key={book.id} onClick={() => navigate(book.id ? `/${book.id}` : '/')}>
                {book.bookName}
              </Button>
            ),
        )}
    </>
  )
}
