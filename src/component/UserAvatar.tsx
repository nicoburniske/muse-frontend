import { useMemo } from 'react'
import { nonNullable } from 'util/Utils'


export enum TooltipPos {
    None = '',
    Left = 'md:tooltip-left',
    Right = 'md:tooltip-right',
    Up = 'md:tooltip-up',
    Down = 'md:tooltip-bottom'
}

const size = 'w-6 md:w-8 lg:w-8'

interface UserAvatarProps { displayName?: string, image?: string, tooltipPos?: TooltipPos, className?: string }

export default function UserAvatar({ displayName, image, tooltipPos = TooltipPos.None, className }: UserAvatarProps) {
    const tooltip = useMemo(() => displayName ? 'md:tooltip md:tooltip-primary ' + tooltipPos : '', [])

    if (nonNullable(image) && image.length > 0) {
        return (
            <div className={`avatar ${className} ${tooltip}`} data-tip={displayName}>
                <div className={`${size} rounded-full ring ring-primary ring-offset-base-100 ring-offset-2`}>
                    <img src={image} />
                </div>
            </div>
        )
    } else {
        return (
            <div className={`avatar ${className} ${tooltip}`} data-tip={displayName}>
                <div className={`bg-neutral-focus text-neutral-content rounded-full ${size}`}>
                    <span>{displayName}</span>
                </div>
            </div>
        )
    }

}