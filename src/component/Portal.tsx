import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'


export default function Portal({ children }: { children: JSX.Element }) {
    // return createPortal((<Delayed>{children}</Delayed>), document.body)
    return createPortal(children, document.body)
}
