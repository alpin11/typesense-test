import gql from 'graphql-tag';

export const GET_ANALYTICS_CHART_DATA = gql`
    query GetAnalyticsChartData($input: SearchAnalyticsChartInput!) {
        searchAnalyticsChartData(input: $input) {
            chartType
            points {
                ... on SearchAnalyticsChartTotalDataPoint {
                    date
                    totalQueryCount
                }
                ... on SearchAnalyticsChartRateDataPoint {
                    date
                    totalQueryCount
                    targetCount
                    rate
                }
                ... on SearchAnalyticsChartClickPosDataPoint {
                    date
                    clickCount
                    average
                }
            }
        }
    }
`;
