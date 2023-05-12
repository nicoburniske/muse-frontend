import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
   hooks: { afterAllFileWrite: ['prettier --write'] },
   schema: {
      'http://localhost:8883/api/graphql': {
         headers: {
            Authorization: 'Bearer 2eb18d24-7d6b-49df-82f3-6aaf78a54ad8',
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
