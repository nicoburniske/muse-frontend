# Muse

<img src="public/logo.png" width="350" title="Muse Logo">

A place for music lovers to create interactive and collaborative reviews for music on Spotify.

> Backend Code is available here https://github.com/nicoburniske/muse.

> Currently in Open Beta.

## Intro

Have you ever made someone, or collaborated with someone on, a playlist? Have you every wanted to share your thoughts on a new album with your friends?

Muse was made to fill the gap between peoples thoughts, their friends, and the music that they enjoy.

## Capabilities

-  Integrated Spotify Player in Browser using [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)
-  Create reviews on Albums and Playlists.
-  Share review with other Muse users. Can be edit or view only access.
-  Comment on individual tracks in Reviews.
-  New/Modified/Deleted comments are rendered instantly through GraphQL Subscription events.
-  Responsive Design with Tailwind.
-  Variety of Themes supported!

## Technologies

-  [Tanstack Query](https://github.com/tanstack/query) + [Jotai](https://github.com/pmndrs/jotai) for state management.
   -  This combo has quickly become a personal favorite.
-  [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) for Styling.
-  [shadcn/ui](https://github.com/shadcn/ui) for styled accessible components (all with Tailwind).
-  [Headless UI](https://github.com/tailwindlabs/headlessui) and [RadixUI](https://github.com/radix-ui/primitives) for accessible components.
-  [Tanstack Virtual](https://github.com/tanstack/virtual) for performant virtualized lists.
-  [React DnD](https://github.com/react-dnd/react-dnd) for Drag and Drop capabilities.
-  [React Hook Form](https://github.com/react-hook-form/react-hook-form) + [zod](https://github.com/colinhacks/zod) for forms + validation
-  [React Router](https://github.com/remix-run/react-router) for Routing.

### Comment Capabilities

<img width="872" alt="CommentExample" src="https://user-images.githubusercontent.com/46934294/236480882-2d492794-e55c-4365-9002-b60abb929346.png">

-  Support markdown.
-  Support interactive timestamps 
   - Clicking on timestamps will play the given track at the timestamp on your current Spotify Session
-  Comments support replies.
-  Comments can be re-ordered.
