import { useMutation, UseMutationOptions } from '@tanstack/react-query'

const useCopyToClipboard = (options?: UseMutationOptions<boolean, unknown, string, unknown>) =>
   useMutation({
      mutationFn: copy,
      ...options,
   })

export default useCopyToClipboard

type CopyFn = (text: string) => Promise<boolean> // Return success
const copy: CopyFn = async (text: string) => {
   if (!navigator?.clipboard) {
      return false
   }

   try {
      await navigator.clipboard.writeText(text)
      return true
   } catch (error) {
      console.warn('Copy failed', error)
      return false
   }
}
