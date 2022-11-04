import { AppConfig } from "util/AppConfig";

export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
    return async (): Promise<TData> => {
      const res = await fetch(AppConfig.httpGraphEndpoint, {
      method: "POST",
      ...({"credentials":"include"}),
        body: JSON.stringify({ query, variables }),
      });
  
      const json = await res.json();
  
      if (json.errors) {
        const { message } = json.errors[0];
  
        throw new Error(message);
      }
  
      return json.data;
    }
  }