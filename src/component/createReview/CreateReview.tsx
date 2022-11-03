import { useAtom, useSetAtom } from 'jotai'
import SearchSpotify, { entityIdAtom } from 'component/searchSpotify/SearchSpotify';
import { PlusIcon } from 'component/Icons';
import { ThemeModal } from 'component/ThemeModal';
import { Dialog } from '@headlessui/react';
import { createReviewModalOpenAtom, debouncedReviewNameAtom } from './createReviewAtoms';
import { EditReviewName } from './EditReviewName';
import { CreateReviewButtons } from './CreateReviewButtons';
import { ReviewProperties } from './ReviewProperties';
import { orElse } from 'util/Utils';



export default function CreateReview({ title, icon , className}: { title?: string, icon?: JSX.Element , className?: string }) {
    const [isModalOpen, setModalOpen] = useAtom(createReviewModalOpenAtom)
    const setEntityId = useSetAtom(entityIdAtom)
    const setReviewName = useSetAtom(debouncedReviewNameAtom)

    const modalTitle = orElse(title, "create review")
    const openModalIcon = icon ?? <PlusIcon />

    return (
        <div>
            <ThemeModal open={isModalOpen} className="max-w-2xl">
                <div className="flex flex-col w-full items-center justify-between space-y-5 p-3 " >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-base-content flex-1"> {modalTitle} </h3>
                    </Dialog.Title>
                    <EditReviewName />
                    <ReviewProperties />
                    <SearchSpotify onClear={
                        () => {
                            setEntityId(undefined)
                            setReviewName("")
                        }
                    } />
                    <CreateReviewButtons />
                </div>
            </ThemeModal>

            <button className={className} onClick={() => setModalOpen(true)} >
                {openModalIcon}
            </button>
        </div>
    )
}
