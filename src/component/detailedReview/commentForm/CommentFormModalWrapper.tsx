import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { openCommentModalAtom } from 'state/Atoms'
import { CommentFormModal } from './CommentFormModal'

export const CommentFormModalWrapper = () => {
    const modalData = useAtomValue(openCommentModalAtom)
    // TODO: Title is changing too fast. Before Modal is closing
    const open = useMemo(() => modalData !== undefined, [modalData])

    return (
        <CommentFormModal
            open={open}
            title={modalData?.title ?? 'rrrs'}
            onCancel={modalData?.onCancel ?? (() => { })}
            onSubmit={modalData?.onSubmit ?? (async () => {return})}
            initialValue={modalData?.initialValue}
            trackId={modalData?.trackId ?? ''}
        />
    )
}