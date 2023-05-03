import gql from 'graphql-tag';

export const GET_ANALYTICS_QUERY_DATA = gql`
    query GetAnalyticsQueryData($input: SearchAnalyticsQueryInput!) {
        searchAnalyticsQueryData(input: $input) {
            startDate
            endDate
            rows {
                query
                count
                hitCount
                viewRate
                clickRate
                clickPos
                proportion
            }
        }
    }
`;
