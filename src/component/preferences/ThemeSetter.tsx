import { Theme, useTheme } from 'state/UserPreferences'


export const ThemeSetter = () => {
    const [theme, setTheme] = useTheme()

    return (
        <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="select select-bordered">
            {Object.values(Theme)
                .sort((a, b) => a.localeCompare(b))
                .map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
    )
}