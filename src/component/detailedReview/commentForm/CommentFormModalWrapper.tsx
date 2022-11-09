import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { openCommentModalAtom } from 'state/Atoms'
import { CommentFormModal } from './CommentFormModal'

export const CommentFormModalWrapper = () => {
    const modalData = useAtomValue(openCommentModalAtom)
    const open = useMemo(() => modalData !== undefined, [modalData])

    return (
        <CommentFormModal
            open={open}
            title={modalData?.title ?? ''}
            onCancel={modalData?.onCancel ?? (() => { })}
            onSubmit={modalData?.onSubmit ?? (async () => {return})}
            initialValue={modalData?.initialValue}
        />
    )
}