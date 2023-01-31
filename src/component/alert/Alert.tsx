import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { ReactNode } from 'react'
import { classNames } from 'util/Utils'

export enum AlertSeverity {
    Error,
    Warning,
    Success
}

export const Alert = ({ severity, children, className}: { severity: AlertSeverity, children: ReactNode, className?: string}) => {
    const alertClass =
        severity === AlertSeverity.Error ? 'alert alert-error' :
            severity === AlertSeverity.Warning ? 'alert alert-warning' :
                'alert alert-success'
    return (
        <div className={classNames('alert shadow-lg', alertClass, className)}>
            <div>
                <ExclamationTriangleIcon className="w-6 h-6"/>
                {children}
            </div>
        </div>)
}