import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, ModalService, NotificationService } from '@vendure/admin-ui/core';
import { ChartConfiguration } from 'chart.js';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
    GetAnalyticsChartDataQuery,
    GetAnalyticsChartDataQueryVariables,
    SearchAnalyticsChartClickPosDataPoint,
    SearchAnalyticsChartRateDataPoint,
    SearchAnalyticsChartTotalDataPoint,
    SearchAnalyticsChartType,
} from '../../generated-types';
import { toLineChartConfig } from '../chart/to-chart-config';
import { SearchAnalyticsComponent } from '../search-analytics/search-analytics.component';

import { GET_ANALYTICS_CHART_DATA } from './analytics-overview.graphql';

type ChartTypePointMap = {
    [SearchAnalyticsChartType.TOTAL_SEARCHES]: SearchAnalyticsChartTotalDataPoint;
    [SearchAnalyticsChartType.NO_RESULT_RATE]: SearchAnalyticsChartRateDataPoint;
    [SearchAnalyticsChartType.NO_CLICK_RATE]: SearchAnalyticsChartRateDataPoint;
    [SearchAnalyticsChartType.CLICK_THROUGH_RATE]: SearchAnalyticsChartRateDataPoint;
    [SearchAnalyticsChartType.CLICK_POSITION]: SearchAnalyticsChartClickPosDataPoint;
};

type RateChartType =
    | SearchAnalyticsChartType.NO_RESULT_RATE
    | SearchAnalyticsChartType.NO_CLICK_RATE
    | SearchAnalyticsChartType.CLICK_THROUGH_RATE;

@Component({
    selector: 'kb-analytics-overview',
    templateUrl: './analytics-overview.component.html',
    styleUrls: ['./analytics-overview.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AnalyticsOverviewComponent implements OnInit {
    totalSearches$: Observable<ChartConfiguration>;
    noResultRate$: Observable<ChartConfiguration>;
    clickThroughRate$: Observable<ChartConfiguration>;
    noClickRate$: Observable<ChartConfiguration>;
    clickPosition$: Observable<ChartConfiguration>;

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private router: Router,
        private route: ActivatedRoute,
        private parent: SearchAnalyticsComponent,
    ) {}

    ngOnInit() {
        const dateRange$ = this.parent.dateRange$;
        this.totalSearches$ = dateRange$.pipe(
            switchMap(([start, end]) => {
                return this.fetchChartData(SearchAnalyticsChartType.TOTAL_SEARCHES, start, end);
            }),
            map((points) => {
                const data = points.map((p) => ({
                    y: p.totalQueryCount,
                    x: p.date.split('T')[0],
                }));
                return toLineChartConfig({
                    title: 'Total searches',
                    data,
                    color: '#22d5d5',
                });
            }),
        );
        this.noResultRate$ = this.fetchAndMapRatePoints({
            type: SearchAnalyticsChartType.NO_RESULT_RATE,
            dateRange$,
            title: 'No results rate',
            color: '#c97930',
        });
        this.clickThroughRate$ = this.fetchAndMapRatePoints({
            type: SearchAnalyticsChartType.CLICK_THROUGH_RATE,
            dateRange$,
            title: 'Click through rate',
            color: '#4f95ba',
        });
        this.noClickRate$ = this.fetchAndMapRatePoints({
            type: SearchAnalyticsChartType.NO_CLICK_RATE,
            dateRange$,
            title: 'No click rate',
            color: '#4469ba',
        });
        this.clickPosition$ = dateRange$.pipe(
            switchMap(([start, end]) =>
                this.fetchChartData(SearchAnalyticsChartType.CLICK_POSITION, start, end),
            ),
            map((points) => {
                const data = points.map((p) => ({
                    y: p.average,
                    x: p.date.split('T')[0],
                }));
                return toLineChartConfig({
                    title: 'Avg click position',
                    data,
                    color: '#443fd5',
                });
            }),
        );
    }

    private fetchAndMapRatePoints<T extends RateChartType>(options: {
        type: T;
        dateRange$: Observable<[string, string]>;
        title: string;
        color: `#${string}`;
    }): Observable<ChartConfiguration> {
        const { type, dateRange$, title, color } = options;
        return dateRange$.pipe(
            switchMap(([start, end]) => this.fetchChartData(type, start, end)),
            map((points) => {
                const data = points.map((p) => ({
                    y: p.rate * 100,
                    x: p.date.split('T')[0],
                }));
                return toLineChartConfig({
                    title,
                    data,
                    color,
                    isPercentageChart: true,
                });
            }),
        );
    }

    private fetchChartData<T extends SearchAnalyticsChartType>(
        type: T,
        start: string,
        end: string,
    ): Observable<Array<ChartTypePointMap[T]>> {
        return this.dataService
            .query<GetAnalyticsChartDataQuery, GetAnalyticsChartDataQueryVariables>(
                GET_ANALYTICS_CHART_DATA,
                {
                    input: {
                        chartType: type,
                        startDate: start,
                        endDate: end,
                    },
                },
            )
            .mapSingle(
                ({ searchAnalyticsChartData }) =>
                    searchAnalyticsChartData.points as Array<ChartTypePointMap[T]>,
            );
    }
}
