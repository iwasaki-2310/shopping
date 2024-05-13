import { collection, query, getDocs } from 'firebase/firestore'
import { checkQuotaAndFetch } from '../utils/quotaManager'
import { db } from '../components/providers/GoogleLoginUserProvider'

export async function fetchBooks(navigate: Function) {
  // Firestoreのデータベースから'books'コレクションを参照する
  const booksCollection = collection(db, 'books')
  // 上記のコレクションに対するクエリを作成する
  const booksQuery = query(booksCollection)
  // クエリを実行し、クオータをチェックしながらデータを取得する
  return checkQuotaAndFetch(booksQuery, navigate)
}
