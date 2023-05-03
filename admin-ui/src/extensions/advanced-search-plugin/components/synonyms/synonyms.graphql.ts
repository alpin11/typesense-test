import gql from 'graphql-tag';

export const SYNONYM_FRAGMENT = gql`
    fragment Synonym on SearchSynonym {
        name
        root
        synonyms
    }
`;
export const GET_SYNONYMS = gql`
    query GetSynonyms {
        searchSynonyms {
            ...Synonym
        }
    }
    ${SYNONYM_FRAGMENT}
`;

export const GET_SYNONYM = gql`
    query GetSynonym($name: String!) {
        searchSynonym(name: $name) {
            ...Synonym
        }
    }
    ${SYNONYM_FRAGMENT}
`;

export const CREATE_SYNONYM = gql`
    mutation CreateSynonym($input: SearchSynonymInput!) {
        createSearchSynonym(input: $input) {
            ...Synonym
        }
    }
    ${SYNONYM_FRAGMENT}
`;

export const UPDATE_SYNONYM = gql`
    mutation UpdateSynonym($input: SearchSynonymInput!) {
        updateSearchSynonym(input: $input) {
            ...Synonym
        }
    }
    ${SYNONYM_FRAGMENT}
`;

export const DELETE_SYNONYM = gql`
    mutation DeleteSynonym($name: String!) {
        deleteSearchSynonym(name: $name) {
            result
            message
        }
    }
`;
