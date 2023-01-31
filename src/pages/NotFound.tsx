import { useNavigate } from 'react-router-dom'
import { nonNullable } from 'util/Utils'

export const NotFound = ({ redirect, label}: { redirect?: string, label: string }) => {
    const nav = useNavigate()
    const goBack = () => nonNullable(redirect) ? nav(redirect) : nav(-1)

    return (
        <div className="hero min-h-screen bg-base-100">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Not Found!</h1>
                    <p className="py-6">Doesn't seem like there's anything here...</p>
                    <button className="btn btn-primary" onClick={goBack}>{label}</button>
                </div>
            </div>
        </div>
    )
}