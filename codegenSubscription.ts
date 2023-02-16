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
