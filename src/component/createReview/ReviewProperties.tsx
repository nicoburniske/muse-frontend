import { EntityType } from 'graphql/generated/schema'
import { PrimitiveAtom, useAtom } from 'jotai'

export const ReviewProperties = ({
   entityTypeAtom,
   isPublicAtom,
}: {
   entityTypeAtom: PrimitiveAtom<EntityType>
   isPublicAtom: PrimitiveAtom<boolean>
}) => {
   const [entityType, setEntityType] = useAtom(entityTypeAtom)
   const [isPublic, setIsPublic] = useAtom(isPublicAtom)

   return (
      <div className='flex w-full flex-row space-x-1'>
         <div className='form-control w-1/2'>
            <label className='label'>
               <span className='label-text text-base-content'>Type</span>
            </label>
            <select
               value={entityType}
               onChange={e => setEntityType(e.target.value as EntityType)}
               className='select select-bordered w-full'
            >
               {
                  // TODO: Add Track
                  [EntityType.Playlist, EntityType.Album, EntityType.Artist].map(e => (
                     <option key={e} value={e}>
                        {e.toLowerCase()}
                     </option>
                  ))
               }
            </select>
         </div>
         <div className='form-control w-1/2'>
            <label className='label'>
               <span className='label-text text-base-content'>Is Public</span>
            </label>
            <select
               value={fromBool(isPublic)}
               onChange={e => setIsPublic(toBool(+e.target.value))}
               className='select select-bordered w-full'
            >
               <option value={0}>false</option>
               <option value={1}>true</option>
            </select>
         </div>
      </div>
   )
}

const fromBool = (b: boolean) => (b ? 1 : 0)
const toBool = (num: number) => num === 1
