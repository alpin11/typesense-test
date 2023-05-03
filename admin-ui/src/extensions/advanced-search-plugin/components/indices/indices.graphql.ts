import gql from 'graphql-tag';

export const GET_EXTERNAL_INDEXES = gql`
    query GetExternalIndexes {
        externalSearchIndexes {
            name
            responseTypeName
            fields {
                name
                type
            }
        }
    }
`;
