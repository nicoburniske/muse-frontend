import { PlaybackDeviceFragment, PlaybackState, PlaybackStateFragment } from 'graphql/generated/schema'
import { atom } from 'jotai'

export const selectedTrack = atom<string | undefined>(undefined)
export const currentlyPlayingTrack = atom<string | undefined> (undefined) 
export const playbackDevices = atom<PlaybackDeviceFragment[]>([])