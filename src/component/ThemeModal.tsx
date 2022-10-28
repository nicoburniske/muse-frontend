import { Dialog } from "@headlessui/react"
import { useAtomValue } from "jotai"
import { themeAtom } from "state/Atoms"

export const ThemeModal = ({ open, children, className }: {className?:string,  open: boolean, children: JSX.Element }) => {
    const theme = useAtomValue(themeAtom)
    return (
        // Returning null avoids close on click outside of modal.
        <Dialog open={open} onClose={() => null} data-theme={theme}>
            <div className="fixed inset-x-0  top-0 sm:inset-0 bg-base-300/30" aria-hidden="true" />
            <div className="fixed inset-x-0 top-0 sm:inset-0 grid place-items-center p-4 w-full z-50">
                <Dialog.Panel className={"w-full rounded bg-neutral border-primary relative " + className}>
                    {children}
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}


