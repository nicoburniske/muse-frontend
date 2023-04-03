# Muse 
<img src="public/logo.png" width="350" title="Muse Logo">

A place for music lovers to create interactive and collaborative reviews for music on Spotify.

> Backend Code is available [here](https://github.com/nicoburniske/muse)

> Currently in Closed Beta. Waiting to be granted Spotify Quota Extension. Look [here](https://developer.spotify.com/documentation/web-api/guides/development-extended-quota-modes/) for more information

## Intro
Have you ever made someone, or collaborated with someone on, a playlist? Have you every wanted to share your thoughts on a new album with your friends? 

Muse was made to fill the gap between peoples thoughts, their friends, and the music that they enjoy.


## Capabilities

- Integrated Spotify Player in Browser using [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/) 
- Create reviews on Playlists on Albums and Playlists. Artists and Tracks not yet supported.
- Share review with other Muse/Spotify users. Can be edit or view only access.
- Comment on individual tracks in Reviews.
- New/Modified comments are rendered instantly through GraphQL Subscription.
- Responsive Design with Tailwind to be Mobile friendly.


### Comment Capabilities
<img width="884" alt="commentExample" src="https://user-images.githubusercontent.com/46934294/227563389-f7689a0d-94bb-422b-8130-f626c4a0f130.png">

- Support markdown. 
- Support interactive timestamps (Clicking on timestamps will play the given track at the timestamp on your current Spotify Session)
- Comments support replies.
- Comments can be re-ordered.


## Technologies
- [Tanstack Query](https://github.com/tanstack/query) + [Jotai](https://github.com/pmndrs/jotai) for state management.
   - This combo has quickly become a personal favorite.
- [Tailwind](https://github.com/tailwindlabs/tailwindcss) for Styling.
- [Daisy UI](https://github.com/saadeghi/daisyui) for a variety of Themes.
- [Headless UI](https://github.com/tailwindlabs/headlessui) and [RadixUI](https://github.com/radix-ui/primitives) for accessible components.
- [Tanstack Virtual](https://github.com/tanstack/virtual) for performant virtualized lists.
- [React DnD](https://github.com/react-dnd/react-dnd) for Drag and Drop capabilities.


## Preview Videos

### Reviews Page

https://user-images.githubusercontent.com/46934294/229527241-388502a1-3746-4657-bdc7-ebeb37e9358d.mov

### Create Review and Add Comments

https://user-images.githubusercontent.com/46934294/229527595-221814ba-fba8-4e41-b257-2d1e4af32887.mov

### Theme Selector

https://user-images.githubusercontent.com/46934294/229528295-50dc2a05-6210-487e-a0a1-a2f51456c963.mov
