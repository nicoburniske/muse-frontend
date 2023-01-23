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

interface UserAvatarProps {
    displayName?: string
    tooltip?: string
    image?: string
    tooltipPos?: TooltipPos
    className?: string
}

// TODO: refactor this. Use popup from headlessui.
export default function UserAvatar({ displayName, tooltip, image, tooltipPos = TooltipPos.None, className }: UserAvatarProps) {
    const tooltipClasses = useMemo(() => displayName ? 'md:tooltip md:tooltip-primary ' + tooltipPos : '', [])
    // Handles case where spotify created a playlist.
    const name = (displayName?.length ?? 0) > 0 ? displayName! : 'Spotify'

    if (nonNullable(image) && image.length > 0) {
        return (
            <div className={`avatar ${className} ${tooltipClasses}`} data-tip={tooltip ?? displayName}>
                <div className={`${size} rounded-full ring ring-primary ring-offset-base-100 ring-offset-2`}>
                    <img src={image} />
                </div>
            </div>
        )
    } else {
        return (
            <div className={`avatar placeholder ${className} ${tooltipClasses}`} data-tip={tooltip}>
                <div className={`bg-neutral-focus text-neutral-content rounded-full w-12 ${size}`}>
                    <span>
                        {name.slice(0, 1)}
                    </span>
                </div>
            </div>
        )
    }

}