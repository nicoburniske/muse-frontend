import BrowsePage from 'component/browseReviews/BrowsePage'
import CreateReview from 'component/browseReviews/CreateReview';
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { useAtom } from 'jotai';
import { Routes, Route, useNavigate } from "react-router-dom";
import { Theme, themeAtom } from 'state/Atoms';
import "./index.css"


export default function App() {
  const nav = useNavigate()
  const linkToHome = () => nav("")
  const [theme, setTheme] = useAtom(themeAtom)
  return (
    <div data-theme={theme} className="h-screen bg-base-300">
      <div className="navbar ">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </label>
            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              {/* <li><a>Homepage</a></li>
              <li><a>Portfolio</a></li>
              <li><a>About</a></li> */}
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <a className="btn btn-ghost normal-case text-xl" onClick={linkToHome}>muse</a>
        </div>
        <div className="navbar-end flex flex-row space-x-5">
          <CreateReview />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="select select-bordered w-full max-w-xs">
            <option disabled selected>Access Level</option>
            {Object.values(Theme).map((e) => <option value={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="reviews/:reviewId" element={<DetailedReviewPage />} />
        </Routes>
      </div>
    </div>
  )
}

