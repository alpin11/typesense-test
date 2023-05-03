import gql from 'graphql-tag';

export const REINDEX_EXTERNAL = gql`
    mutation ReindexExternal($names: [String!]!) {
        reindexExternal(externalIndexNames: $names)
    }
`;
