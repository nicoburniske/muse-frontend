import { ErrorBoundary } from 'react-error-boundary'
import { SideNavBar } from './SideNavBar'
import { Alert, AlertSeverity } from 'component/Alert'
import { Suspense } from 'react'
import { SpotifyPlayerWrapper } from 'component/detailedReview/playback/SpotifyPlayerWrapper'
import { MobileMenu } from './MobileMenu'
import Portal from 'component/Portal'

// Add navbar and player to the page.
export const NavPlayerPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-full flex-col bg-base-300">
            <div className="flex grow flex-row overflow-hidden" >
                <SideNavBar />
                {children}
            </div>
            <div className='w-full'>
                <ErrorBoundary fallback={
                    <Alert severity={AlertSeverity.Error}>
                        <span> Error Starting Playback </span>
                    </Alert >
                }>
                    <Suspense fallback={
                        <progress className="progress progress-primary" />
                    }>
                        <SpotifyPlayerWrapper reviewId={''} />
                    </Suspense>
                </ErrorBoundary>
            </div>
            <Portal>
                <MobileMenu />
            </Portal>
        </div >
    )
}