import { ReactNode } from 'react'
import { createPortal } from 'react-dom'


export default function Portal({ children }: { children: ReactNode }) {
    return createPortal(children, document.body)
}
