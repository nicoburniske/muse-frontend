
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

export type RepeatState = 'track' | 'context' | 'off'
export type DeviceIdOptions = {
    device_id?: string
}
export type PlayOptions = {
    device_id?: string;
    context_uri?: string;
    uris?: string[];
    offset?: { position: number } | { uri: string };
};

export type EntityType = 'Album' | 'Artist' | 'Playlist' | 'Track'
export type ContextType = 'Album' | 'Artist' | 'Playlist'

export type Entity<T extends EntityType> = {
    id: string
    entityType: T
}

export type EntityList<T extends EntityType> = {
    ids: string[]
    entityType: T
}

// export type PlayType<ContextType> = ContextType extends 'Album' ? 'Track' : ContextType extends 'Artist' ? 'Album' | 'Track' : 'Track'
export type PlayEntityOptions<Outer extends ContextType, Inner extends EntityType> = {
    outer?: Entity<Outer>
    inner?: EntityList<Inner>
} & DeviceIdOptions


export const toUri = (entityType: EntityType, id: string) => {
    return `spotify:${entityType.toLowerCase()}:${id}`
}

export const SpotifyClient = (accessToken: string) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    }
    async function spotifyRequest<T>(endpoint: string, method: string, body?: Object, params?: any): Promise<T> {
        const paramString = params ? `?${new URLSearchParams(params)}` : ''
        const url = `${SPOTIFY_API_URL}${endpoint}${paramString}`

        const bodySerialized = body ? JSON.stringify(body) : undefined

        const response = await fetch(url, {
            method, body: bodySerialized, headers
        })
        return response.body as T
    }

    /**
     * Set the Repeat Mode for the User's Playback
     *
     * Set the repeat mode for the user's playback.
     *
     * @param state The desired repeat mode.
     * @param options Optional request information.
     */
    const setRepeat = (state: RepeatState, options?: DeviceIdOptions): Promise<void> =>
        spotifyRequest<void>('/me/player/repeat', 'PUT', undefined, {
            ...options,
            state,
        })

    /**
     * Toggle Shuffle For User's Playback
     *
     * Toggle shuffle on or off for user's playback.
     *
     * @param state The desired shuffle state.
     * @param options Optional request information.
     */
    const setShuffle = (state: boolean, options?: DeviceIdOptions): Promise<void> =>
        spotifyRequest<void>('/me/player/shuffle', 'PUT', undefined, {
            ...options,
            state,
        })

    /**
    * Transfer a User's Playback
    *
    * Transfer playback to a new device and determine if it should start playing.
    *
    * @param deviceId The ID of the device on which playback should be started/transferred.
    * @param options Optional request information.
    */
    const transferPlayback = (options: { deviceId: string, play?: boolean }): Promise<void> =>
        spotifyRequest<void>('/me/player', 'PUT', {
            ...options,
            device_ids: [options.deviceId]
        }, undefined)


    /**
     * Start or Resume a User's Playback
     *
     * Start a new context or resume current playback on the user's active device.
     *
     * @param options Optional request information.
     */
    const play = (options?: PlayOptions): Promise<void> => {
        const { device_id, ...bodyParams } = options ?? {}

        return spotifyRequest<void>(
            '/me/player/play',
            'PUT',
            { bodyParams },
            device_id ? { device_id } : undefined
        )
    }

    const playEntityContext = <Outer extends ContextType, Inner extends EntityType>(options?: PlayEntityOptions<Outer, Inner>) => {
        const { outer, inner, device_id } = options ?? {}
        const context_uri = outer ? toUri(outer.entityType, outer.id) : undefined
        const uris = inner ? inner.ids.map(id => toUri(inner.entityType, id)) : undefined

        return play({ device_id, context_uri, uris })
    }

    return {
        setRepeat,
        setShuffle,
        transferPlayback,
        play,
        playEntityContext
    }
}


