import { EntityType } from "graphql/generated/schema"
import { useAtom } from "jotai"
import { BoolNum } from "util/Utils"
import { entityTypeAtom, isPublicAtom } from "./createReviewAtoms"

export const ReviewProperties = () => {
    const [entityType, setEntityType] = useAtom(entityTypeAtom)
    const [isPublic, setIsPublic] = useAtom(isPublicAtom)

    return (<div className="flex flex-row w-full space-x-1">
        <div className="form-control w-1/2">
            <label className="label">
                <span className="label-text text-base-content">type</span>
            </label>
            <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="select select-bordered w-full">
                {
                    // For now only allow playlists.
                    // Object.values(EntityType)
                    [EntityType.Playlist].map((e) =>
                        <option key={e} value={e}>{e.toLowerCase()}</option>)
                }
            </select>
        </div>
        <div className="form-control w-1/2">
            <label className="label">
                <span className="label-text text-base-content">is public</span>
            </label>
            <select
                value={isPublic} onChange={(e) => setIsPublic(+e.target.value as BoolNum)}
                className="select select-bordered w-full">
                <option value={0}>false</option>
                <option value={1}>true</option>
            </select>
        </div>
    </div>)
}