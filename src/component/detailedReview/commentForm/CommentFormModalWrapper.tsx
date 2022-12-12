import { atom, useAtomValue, useSetAtom } from 'jotai'
import ReactDOM from 'react-dom'
import { CommentFormModal } from './CommentFormModal'

interface CommentModalData {
    trackId: string
    title: string
    initialValue?: string

    onSubmit: (comment: string) => Promise<void>
    onCancel: () => void
}

const defaultModalValue = Object.freeze({
    trackId: '',
    title: '',
    onSubmit: async () => { },
    onCancel: () => { },
})

const commentModalValues = atom<CommentModalData>(defaultModalValue)
const isOpenModalAtom = atom(false)

const openModalAtom = atom(null, (_get, set, value: CommentModalData) => {
    set(commentModalValues, value)
    set(isOpenModalAtom, true)
})
const closeModalAtom = atom(null, (_get, set) => {
    set(isOpenModalAtom, false)
    setTimeout(() => set(commentModalValues, defaultModalValue), 500)
})

export const useCommentModal = () => {
    // TODO: This breaks?
    // const openCommentModal = useMemo(() => useSetAtom(openModalAtom), [])
    // const closeCommentModal = useMemo(() => useSetAtom(closeModalAtom), [])
    const openCommentModal = useSetAtom(openModalAtom)
    const closeCommentModal = useSetAtom(closeModalAtom)
    return {
        openCommentModal,
        closeCommentModal
    }
}

export const CommentFormModalWrapper = () => {
    const modalData = useAtomValue(commentModalValues)
    const open = useAtomValue(isOpenModalAtom)

    return ReactDOM.createPortal(
        <CommentFormModal
            open={open}
            title={modalData.title}
            onCancel={modalData.onCancel}
            onSubmit={modalData.onSubmit}
            initialValue={modalData.initialValue}
            trackId={modalData.trackId}
        />,
        document.body)
}