import { AppConfig } from 'util/AppConfig'

export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    return async (): Promise<TData> => {
        const res = await fetch(AppConfig.httpGraphEndpoint, {
            method: 'POST',
            ...({'credentials':'include'}),
            body: JSON.stringify({ query, variables }),
        })
  
        const json = await res.json()
        // TODO: Consider if there's a way to handle partial errors.
        const errors = json.errors
        const data = json.data
        if (errors && (data === null || data === undefined)) {
            const { message } = errors[0]
  
            throw new Error(message)
        }
  
        return data
    }
}