import { Atom, atom, useAtom, useSetAtom } from 'jotai'
import SearchSpotify from 'component/searchSpotify/SearchSpotify'
import { PlusIcon } from 'component/Icons'
import { ThemeModal } from 'component/ThemeModal'
import { Dialog } from '@headlessui/react'
import { EditReviewName } from './EditReviewName'
import { CreateReviewButtons } from './CreateReviewButtons'
import { ReviewProperties } from './ReviewProperties'
import { orElse } from 'util/Utils'
import { EntityType } from 'graphql/generated/schema'
import atomWithDebounce from 'state/atomWithDebounce'

interface CreateReviewProps {
    title?: string
    icon?: JSX.Element
    className?: string
    parentReviewIdAtom: Atom<string | undefined>
}

const createReviewModalOpenAtom = atom(false)

export default function CreateReview({ title, icon, className, parentReviewIdAtom }: CreateReviewProps) {
    const entityTypeAtom = atom(EntityType.Playlist)
    const entityIdAtom = atom<string | undefined>(undefined)
    const isPublicAtom = atom<boolean>(false)
    const {
        debouncedValueAtom: debouncedReviewNameAtom,
        currentValueAtom: currentReviewNameAtom
    } = atomWithDebounce('')
    const [isModalOpen, setModalOpen] = useAtom(createReviewModalOpenAtom)
    const setReviewName = useSetAtom(debouncedReviewNameAtom)
    const setEntityId = useSetAtom(entityIdAtom)

    const modalTitle = orElse(title, 'create review')
    const openModalIcon = icon ?? <PlusIcon />

    return (
        <>
            <ThemeModal open={isModalOpen} className="max-w-2xl">
                <div className="flex flex-col w-full items-center justify-between space-y-5 p-3" >
                    <Dialog.Title className="font-bold text-lg text-base-content">
                        {modalTitle}
                    </Dialog.Title>
                    <EditReviewName
                        debouncedReviewNameAtom={debouncedReviewNameAtom}
                        currentReviewNameAtom={currentReviewNameAtom} />
                    <ReviewProperties entityTypeAtom={entityTypeAtom} isPublicAtom={isPublicAtom} />
                    <SearchSpotify
                        entityIdAtom={entityIdAtom}
                        entityTypeAtom={entityTypeAtom}
                        onClear={
                            () => {
                                setEntityId(undefined)
                                setReviewName('')
                            }
                        } />
                    <CreateReviewButtons
                        entityTypeAtom={entityTypeAtom}
                        entityIdAtom={entityIdAtom}
                        isPublicAtom={isPublicAtom}
                        parentReviewIdAtom={parentReviewIdAtom}
                        debouncedReviewNameAtom={debouncedReviewNameAtom}
                        createReviewModalOpenAtom={createReviewModalOpenAtom}
                    />
                </div>
            </ThemeModal>

            <button className={className} onClick={() => setModalOpen(true)} >
                {openModalIcon}
            </button>
        </>
    )
}
