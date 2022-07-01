import { useEffect, useMemo, useState } from 'react'
import { EntityType, useCreateReviewMutation } from 'graphql/generated/schema'
import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

export default function CreateReview() {
    const [name, setReviewName] = useState("")
    const [entityType, setEntityType] = useState<EntityType>(EntityType.Album)
    const [entityId, setEntityId] = useState("")
    const [isPublic, setIsPublic] = useState(false)

    // Converts URL to Entity id.
    const convertedEntityId = useMemo(() => {
        const start = entityId.lastIndexOf("/")
        if (start !== -1) {
            const index = entityId.lastIndexOf("?")
            const last = index === -1 ? entityId.length : index
            return entityId.substring(start + 1, last)
        } else {
            return entityId
        }
    }, [entityId])

    // Have we detected a URL? 
    const shouldUpdate = useMemo(() => convertedEntityId !== entityId, [convertedEntityId, entityId])

    // If we have detected a URL, updated EntityType and EntityId accordingly. 
    useEffect(() => {
        const eType: EntityType | null = Object.values(EntityType)
            .filter(t => entityId.includes(EntityType[t].toLowerCase()))?.[0]
        if (eType) {
            setEntityType(eType)
        }
        setEntityId(convertedEntityId)
    }, [shouldUpdate])

    const input = { entityType, entityId, isPublic, name }
    const [createReviewMutation, { data, error, loading }] = useCreateReviewMutation({ variables: { input } })

    const getErrorMessage = () =>
        <Alert severity="warning"> {error?.graphQLErrors.map(e => `${e.message} ${e.extensions.message}`).join(", ")}</Alert >

    const getSuccessMessage = () => {
        const entityType = data?.createReview?.entityType?.toString()
        return <Alert> {`Created ${entityType} review!`} </Alert >
    }

    const canSubmit = useMemo(() => !loading && name.length > 0 && entityId.length > 0, [loading, name, entityId])

    return (
        <Stack p={5} spacing={2} width={300}>
            <TextField
                label="Review Name"
                onChange={e => setReviewName(e.target.value as string)}
            />
            <FormControl>
                <InputLabel>Entity Type</InputLabel>
                <Select
                    value={entityType}
                    label="Entity Type"
                    onChange={e => setEntityType(e.target.value as EntityType)}
                >
                    {
                        Object.values(EntityType).map(e =>
                            <MenuItem key={e} value={e}>{e}</MenuItem>
                        )
                    }
                </Select>
            </FormControl>
            <TextField
                label="Spotify URL / Entity Id"
                onChange={e => setEntityId(e.target.value as string)}
                value={entityId}
            />
            <FormControl>
                <InputLabel>Is Public</InputLabel>
                <Select
                    value={isPublic}
                    label="Is Public"
                    onChange={e => setIsPublic(e.target.value as boolean)}
                >
                    <MenuItem value={false}> False </MenuItem>
                    <MenuItem value={true}> True </MenuItem>
                </Select>
            </FormControl>
            <Button
                disabled={!canSubmit}
                onClick={() => createReviewMutation()}
            >
                Create Review
            </Button>
            { /*TODO clean this up*/}
            {error && getErrorMessage()}
            {data && getSuccessMessage()}
        </Stack>
    )
}