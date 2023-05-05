import { AppConfig } from '@/util/AppConfig'

export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
   return async (): Promise<TData> => {
      const res = await fetch(AppConfig.httpGraphEndpoint, {
         method: 'POST',
         ...{ credentials: 'include' },
         body: JSON.stringify({ query, variables }),
      })

      const json = await res.json()
      // TODO: Consider if there's a way to handle partial errors.
      const errors = json.errors
      const data = json.data
      if (errors && isBadData(data)) {
         const { message } = errors[0]

         throw new Error(message)
      }

      return data
   }
}

// This is necessary because sometimes the data will be null one level deep.
// This is a failure case.
const isBadData = (data: any) => {
   return data === null || data === undefined || Object.entries(data).filter(v => v[1] !== null).length === 0
}
