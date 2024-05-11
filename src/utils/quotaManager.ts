import { getDocs, Query } from 'firebase/firestore'

let readCount = 0
const dailyReadLimit = 10000

export async function checkQuotaAndFetch(query: Query) {
  if (readCount >= dailyReadLimit) {
    throw new Error('Daily read quota exceeded.')
  }
  // Firestoreからドキュメントを取得するクエリを実行し、結果をsnapshotに格納
  const snapshot = await getDocs(query)
  // 取得したドキュメントの数をreadCountに加算
  readCount += snapshot.size
  console.log(`現在のリードカウント：${readCount}`)
  // 取得したドキュメントのデータ部分のみを配列として返す
  return snapshot.docs.map((doc) => doc.data())
}
