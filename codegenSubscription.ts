
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: {
        'http://localhost:8883/api/graphql': {
            headers: {
                'Authorization': ''
            }
        }
    },
    documents: [
        './src/graphql/subscriptions/*.graphql',
        // './src/graphql/fragment/*.graphql',
        './src/graphql/fragment/DetailedComment.fragment.graphql',
        './src/graphql/fragment/UserWithspotifyOverview.fragment.graphql'
    ],
    generates: {
        './src/graphql/generated/urqlSchema.ts': {
            // preset: 'client',
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-urql'
            ],
            config: {
                scalars: {
                    'Long': 'number',
                    'Instant': 'string',
                }
            }
        },
    }
}

export default config

