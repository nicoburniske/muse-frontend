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
   documents: ['./src/graphql/subscriptions/*.graphql', './src/graphql/fragment/*.graphql'],
   generates: {
      './src/graphql/generated/urqlSchema.ts': {
         // preset: 'client',
         plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
         config: {
            enumsAsTypes: true,
            maybeValue: 'T | undefined',
            scalars: {
               Long: 'number',
               Instant: 'string',
            },
         },
      },
   },
}

export default config
