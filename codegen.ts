import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
   schema: {
      'http://localhost:8883/api/graphql': {
         headers: {
            Authorization: '',
         },
      },
   },
   documents: ['./src/**/*.graphql'],
   generates: {
      './src/graphql/generated/schema.ts': {
         plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
         config: {
            exposeFetcher: true,
            exposeQueryKeys: true,
            dedupeFragments: true,
            fetcher: 'graphql/fetcher#fetcher',
            scalars: {
               Long: 'number',
               Instant: 'string',
            },
         },
      },
   },
}

export default config
