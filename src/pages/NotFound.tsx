import { useNavigate } from 'react-router-dom'

export const NotFound = () => {
    const nav = useNavigate()
    const goHome = () => nav('/')

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Not Found!</h1>
                    <p className="py-6">Doesn't seem like there's anything here...</p>
                    <button className="btn btn-primary" onClick={goHome}>home</button>
                </div>
            </div>
        </div>
    )
}