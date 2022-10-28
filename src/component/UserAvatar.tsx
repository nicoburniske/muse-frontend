import { useMemo } from "react"


export enum TooltipPos {
    None = '',
    Left = 'md:tooltip-left',
    Right = 'md:tooltip-right',
    Up = 'md:tooltip-up',
    Down = 'md:tooltip-bottom'
}

interface UserAvatarProps { displayName?: string, image?: string, tooltipPos?: TooltipPos, className?: string }

export default function UserAvatar({ displayName, image, tooltipPos = TooltipPos.None , className}: UserAvatarProps) {
    const tooltip = useMemo(() => displayName ? 'md:tooltip md:tooltip-primary ' + tooltipPos : '', [])

    return (
        <div className={`avatar ${className} ${tooltip}`} data-tip={displayName}>
            <div className="w-6 md:w-8 lg:w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={image} />
            </div>
        </div>
    )
}