import gql from 'graphql-tag';

export const OVERRIDE_ASSET_FRAGMENT = gql`
    fragment OverrideAsset on SearchResultAsset {
        id
        preview
        focalPoint {
            x
            y
        }
    }
`;

export const OVERRIDE_FRAGMENT = gql`
    fragment Override on SearchOverride {
        name
        query
        exactMatch
        includes {
            id
            position
            productVariantName
            productAsset {
                ...OverrideAsset
            }
        }
        excludes {
            id
            productVariantName
            productAsset {
                ...OverrideAsset
            }
        }
    }
    ${OVERRIDE_ASSET_FRAGMENT}
`;

export const GET_OVERRIDES = gql`
    query GetSearchOverrides {
        searchOverrides {
            ...Override
        }
    }
    ${OVERRIDE_FRAGMENT}
`;
export const GET_OVERRIDE = gql`
    query GetSearchOverride($name: String!) {
        searchOverride(name: $name) {
            ...Override
        }
    }
    ${OVERRIDE_FRAGMENT}
`;
export const UPDATE_OVERRIDE = gql`
    mutation UpdateSearchOverride($input: SearchOverrideInput!) {
        updateSearchOverride(input: $input) {
            name
        }
    }
`;
export const DELETE_OVERRIDE = gql`
    mutation DeleteSearchOverride($name: String!) {
        deleteSearchOverride(name: $name) {
            result
            message
        }
    }
`;
