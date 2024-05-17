import { collection, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../providers/GoogleLoginUserProvider'
import React, { useEffect, useState } from 'react'
import { Book } from '../../types/Book'
import { useNavigate } from 'react-router-dom'
import { Button, Heading } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { booksArrayState } from '../../state/atoms/booksArrayState'

export const BookList: React.FC = () => {
  const user = auth.currentUser
  const [books, setBooks] = useRecoilState<Book[]>(booksArrayState)
  const navigate = useNavigate()

  return (
    <>
      <Heading>家計簿の一覧</Heading>
      {books &&
        books.map(
          (book) =>
            book.data.joinedUser.includes(user?.uid) && (
              <Button key={book.id} onClick={() => navigate(book.id ? `/${book.id}` : '/')}>
                {book.data.bookName}
              </Button>
            ),
        )}
    </>
  )
}
