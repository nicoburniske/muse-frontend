import Markdown from 'markdown-to-jsx'
import { createStamp } from './PlayAtTimestamp'
import { useMemo } from 'react'

interface CommentMarkdownProps {
   comment: string
   trackId: string
}

const stampPattern = /@(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/g

const injectStamp = (comment: string): string => {
   return comment.replaceAll(
      stampPattern,
      word =>
         // Account for `@` at the beginning of the string
         `<Stamp at='${word.slice(1, word.length)}'/>`
   )
}

export default function CommentMarkdown({ comment, trackId }: CommentMarkdownProps) {
   const Stamp = createStamp(trackId)
   const injected = useMemo(() => injectStamp(comment), [comment, trackId])
   return (
      <Markdown
         options={{
            overrides: {
               Stamp,
            },
         }}
      >
         {injected}
      </Markdown>
   )
}
