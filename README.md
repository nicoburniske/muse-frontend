# Muse
> A place for music lovers to create interactive and collaborative reviews for music on Spotify.

Currently in Closed Beta. Waiting to be granted Spotify Quota Extension. Look [here](https://developer.spotify.com/documentation/web-api/guides/development-extended-quota-modes/) for more information

## Intro
Have you ever made someone, or collaborated with someone on, a playlist? Have you every wanted to share your thoughts on a new album with your friends? 

Muse was made to fill the gap between peoples thoughts, their friends, and the music that they enjoy. 


## Capabilities

- Integrated Spotify Player in Browser using [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) 
- Create reviews on Playlists on Albums and Playlists. Artists and Tracks not yet supported.
- Share review with other Muse/Spotify users. Can be edit or view only access.
- Comment on individual tracks within context review.

### Comment Capabilities
<img width="884" alt="commentExample" src="https://user-images.githubusercontent.com/46934294/227563389-f7689a0d-94bb-422b-8130-f626c4a0f130.png">

- Support markdown. 
- Support interactive timestamps (Clicking on timestamps will play the given track at the timestamp on your current Spotify Session)
- Comments support replies.
- Comments can be re-ordered.
- New comments are updated instantly  using WebSocket based events.


## Technologies
- [Tanstack Query](https://github.com/tanstack/query) + [Jotai](https://github.com/pmndrs/jotai) for state management.
   - This combo has quickly become a personal favorite.
- [Tailwind](https://github.com/tailwindlabs/tailwindcss) for Styling.
- [Daisy UI](https://github.com/saadeghi/daisyui) for a vareity of Themes.
- [Headless UI](https://github.com/tailwindlabs/headlessui) and [RadixUI](https://github.com/radix-ui/primitives) for accessible components.
- [Tanstack Virtual](https://github.com/tanstack/virtual) for performant virtualized lists.
- [React DnD](https://github.com/react-dnd/react-dnd) for Drag and Drop capabilities.


## Preview Screenshots
### Review Page
<img width="1861" alt="IndividualReviewScreenshot" src="https://user-images.githubusercontent.com/46934294/227567237-c151d30c-0dc0-40bd-9e4f-66499d841bfc.png">

### Reviews Page
<img width="1846" alt="ReviewsPageScreenshot" src="https://user-images.githubusercontent.com/46934294/227568456-d6dcdcbe-4343-47c6-bca7-ab79dae5f32d.png">

### 




Backend Code is available here https://github.com/nicoburniske/muse
