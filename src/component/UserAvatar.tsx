
export default function UserAvatar({ displayName, image }: { displayName: string, image: string }) {
    return (
        <div className="tooltip tooltip-primary tooltip-left" data-tip={displayName}>
            <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={image} />
                </div>
            </div>
        </div>
    )
}