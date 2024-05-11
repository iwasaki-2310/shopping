import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { checkQuotaAndFetch } from '../utils/quotaManager'

export async function fetchBooks() {
  // Firestoreのデータベースから'books'コレクションを参照する
  const booksCollection = collection(db, 'books')
  // 上記のコレクションに対するクエリを作成する
  const booksQuery = query(booksCollection)
  // クエリを実行し、クオータをチェックしながらデータを取得する
  return checkQuotaAndFetch(booksQuery)
}
