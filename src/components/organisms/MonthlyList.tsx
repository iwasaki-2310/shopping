import { DocumentData, Timestamp, collection, doc, getDocs } from 'firebase/firestore'
import { db } from '../providers/GoogleLoginUserProvider'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import { booksArrayState } from '../../state/atoms/booksArrayState'
import { Button } from '@chakra-ui/react'
import { MonthlyInfoType, bookInfoState, bookInfoStateType } from '../../state/atoms/bookIdState'

export const MonthlyList: React.FC = () => {
  const [recoilBookInfo, setRecoilBookInfo] = useRecoilState<bookInfoStateType>(bookInfoState)
  const navigate = useNavigate()

  return (
    <>
      {recoilBookInfo.monthlyInfo ? (
        recoilBookInfo.monthlyInfo.map((info) => (
          <Button key={info.monthlyId} onClick={() => navigate(`./${info.monthlyId}`)}>
            {info.month.toDate().toLocaleDateString().slice(0, -2)}
          </Button>
        ))
      ) : (
        <p>月次情報がありません。</p>
      )}
    </>
  )
}
