import { useAtom } from 'jotai'
import SearchSpotify from 'component/SearchSpotify';
import { PlusIcon } from 'component/Icons';
import { ThemeModal } from 'component/ThemeModal';
import { Dialog } from '@headlessui/react';
import { createReviewModalOpenAtom } from './createReviewAtoms';
import { EditReviewName } from './EditReviewName';
import { CreateReviewButtons } from './CreateReviewButtons';
import { ReviewProperties } from './ReviewProperties';


export default function CreateReview() {
    const [isModalOpen, setModalOpen] = useAtom(createReviewModalOpenAtom)

    return (
        <div>
            <ThemeModal open={isModalOpen} className="max-w-2xl">
                <div className="flex flex-col w-full items-center justify-between space-y-5 p-3 " >
                    <Dialog.Title>
                        <h3 className="font-bold text-lg text-base-content flex-1"> create review </h3>
                    </Dialog.Title>
                    <EditReviewName />
                    <ReviewProperties />
                    <SearchSpotify />
                    <CreateReviewButtons />
                </div>
            </ThemeModal>

            <button className="btn btn-base-300 btn-square" onClick={() => setModalOpen(true)} >
                <PlusIcon />
            </button>
        </div>
    )
}
