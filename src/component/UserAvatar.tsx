import { useMemo } from "react"


export enum TooltipPos {
    None = '',
    Left = 'tooltip-left',
    Right = 'tooltip-right',
    Up = 'tooltip-up',
    Down = 'tooltip-bottom'
}

interface UserAvatarProps { displayName?: string, image?: string, tooltipPos?: TooltipPos }

export default function UserAvatar({ displayName, image, tooltipPos = TooltipPos.None}: UserAvatarProps) {
    const className = useMemo(() => displayName ? 'tooltip tooltip-primary ' + tooltipPos : '', [])

    return (
        <div className={className} data-tip={displayName}>
            <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={image} />
                </div>
            </div>
        </div>
    )
}