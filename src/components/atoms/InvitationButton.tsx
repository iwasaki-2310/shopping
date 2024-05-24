import { Button, useToast } from '@chakra-ui/react'

export const InvitationButton: React.FC = () => {
  const toast = useToast()

  const showToast = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      console.log('URLのコピーに成功しました')
    } catch {
      console.error('URLのコピーに失敗しました')
    }
    toast({
      title: 'Info',
      description: '招待リンクをコピーしました！',
      status: 'success',
      duration: 3000,
      position: 'top',
      isClosable: true,
    })
  }
  return (
    <>
      <Button onClick={() => showToast(location.href)}>招待</Button>
    </>
  )
}
