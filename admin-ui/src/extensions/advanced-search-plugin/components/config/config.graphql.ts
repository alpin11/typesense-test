import gql from 'graphql-tag';

export const GET_SEARCH_CONFIG = gql`
    query GetSearchConfig($collectionName: String!) {
        searchCollectionConfig(collectionName: $collectionName) {
            name
            searchableAttributes {
                enabled
                name
                weight
                typoTolerance
            }
        }
    }
`;

export const UPDATE_SEARCH_CONFIG = gql`
    mutation UpdateSearchConfig($input: AdvancedSearchCollectionConfigInput!) {
        updateSearchCollectionConfig(input: $input) {
            name
            searchableAttributes {
                enabled
                name
                weight
                typoTolerance
            }
        }
    }
`;
