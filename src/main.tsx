import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { Toaster } from 'react-hot-toast';
import { AppConfig } from 'util/AppConfig';
import React from 'react';
import { FILTER_SCHEMA } from 'filtersSchema';

// Such a hack to get session id.
const getSession = () => {
  return fetch(AppConfig.httpSessionEndpoint, { method: 'GET', credentials: 'include' })
    .then(r => r.text())
    .then(a => { return { Authorization: a } })
    .catch(e => console.error("Failed to get session", e))
}

// const wsLink = new GraphQLWsLink(createClient({
//   url: AppConfig.websocketGraphEndpoint,
//   connectionParams: getSession as () => Promise<{ Authorization: string }>
// }));

const queryClient = new QueryClient()

// const httpLink = createHttpLink({
//   uri: AppConfig.httpGraphEndpoint,
//   credentials: 'include'
// })

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   wsLink,
//   httpLink,
// );

// const clientGraphQL = new ApolloClient({
//   cache: new InMemoryCache({ possibleTypes: PossibleTypesResultData.possibleTypes }),
//   link: splitLink,
//   connectToDevTools: true
// });
console.log(FILTER_SCHEMA)
const isDefined = (x: any) => x !== undefined && x !== null
const searchFilter = FILTER_SCHEMA.filter(f => isDefined(f.properties?.search_ui_filter)).filter(f => f.properties?.search_ui_filter)
const searchFilterId = searchFilter.map(f => f.id)
const searchFilterTypes = FILTER_SCHEMA.filter(f => isDefined(f.properties?.search_ui_filter_type))
const searchFilterTypeId = searchFilterTypes.map(f => f.id)

const diff = searchFilterId.filter(x => !searchFilterTypeId.includes(x))
console.log("SIDEBAR FILTERS", searchFilter.length)
console.log("SIDEBAR FILTERS TYPE", searchFilterTypes.length)
console.log("Diff" , diff)


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient} contextSharing={true}>
        <>
          <App />
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              success: {
                className: 'bg-success text-success-content',
              },
              error: {
                className: 'bg-error text-error-content'
              },
            }}
          />
        </>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
