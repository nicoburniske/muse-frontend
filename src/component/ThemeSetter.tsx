import { useAtom } from 'jotai'
import { Theme, themeAtom } from 'state/UserPreferences'


export const ThemeSetter = () => {
    const [theme, setTheme] = useAtom(themeAtom)
    
    return (
        <div className="tooltip tooltip-bottom" data-tip="Theme">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="select select-bordered w-full max-w-xs lg:max-w-md">
                {Object.values(Theme)
                    .sort((a, b) => a.localeCompare(b))
                    .map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
        </div>
    )
}