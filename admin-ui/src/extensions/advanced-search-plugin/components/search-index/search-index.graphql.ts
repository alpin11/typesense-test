import gql from 'graphql-tag';

export const ADVANCED_SEARCH = gql`
    query AdvancedSearch($input: SearchInput!) {
        search(input: $input) {
            totalItems
            searchTimeMs
            facetValues {
                facetValue {
                    id
                    name
                    facet {
                        name
                    }
                }
                count
            }
            collections {
                collection {
                    id
                    name
                }
                count
            }
            items {
                id
                score
                productId
                sku
                productName
                productVariantName
                highlights {
                    field
                    snippet
                }
                productAsset {
                    id
                    preview
                    focalPoint {
                        x
                        y
                    }
                }
                productVariantAsset {
                    id
                    preview
                    focalPoint {
                        x
                        y
                    }
                }
            }
        }
    }
`;

export const CREATE_OVERRIDE = gql`
    mutation CreateSearchOverride($input: SearchOverrideInput!) {
        createSearchOverride(input: $input) {
            name
        }
    }
`;
