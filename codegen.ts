import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
   hooks: { afterAllFileWrite: ['prettier --write'] },
   schema: {
      'http://localhost:8883/api/graphql': {
         headers: {
            Authorization: 'e5117659-4b24-4d0a-8dde-3a66efe4410b',
         },
      },
   },
   documents: ['./src/**/*.graphql'],
   generates: {
      './src/graphql/generated/schema.ts': {
         plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
         config: {
            // TODO: update once this gets merged.
            // Having const variants would be useful. https://github.com/dotansimha/graphql-code-generator/pull/8746
            enumsAsTypes: true,
            maybeValue: 'T | undefined',
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
