import Markdown from 'markdown-to-jsx'
import { createStamp } from './PlayAtTimestamp'

interface CommentMarkdownProps {
   comment: string
   trackId: string
}

export default function CommentMarkdown({ comment, trackId }: CommentMarkdownProps) {
   const Stamp = createStamp(trackId)
   return (
      <Markdown
         options={{
            overrides: {
               Stamp,
            },
         }}
      >
         {comment}
      </Markdown>
   )
}
