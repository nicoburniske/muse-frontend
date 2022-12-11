import { SpotifyWebApi } from 'spotify-web-api-ts'


export type EntityType = 'Album' | 'Artist' | 'Playlist' | 'Track'

export const toUri = (entityType: EntityType, id: string) => {
    return `spotify:${entityType.toLowerCase()}:${id}`
}


export const SpotifyClient = (accessToken: string) => {
    const client = new SpotifyWebApi({ accessToken })

    return client
}


