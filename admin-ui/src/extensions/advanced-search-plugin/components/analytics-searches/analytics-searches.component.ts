import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService, ModalService, NotificationService } from '@vendure/admin-ui/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import {
    GetAnalyticsQueryDataQuery,
    GetAnalyticsQueryDataQueryVariables,
    SearchAnalyticsSortInput,
    SortOrder,
} from '../../generated-types';
import { SearchAnalyticsComponent } from '../search-analytics/search-analytics.component';

import { GET_ANALYTICS_QUERY_DATA } from './analytics-searches.graphql';

@Component({
    selector: 'kb-analytics-searches',
    templateUrl: './analytics-searches.component.html',
    styleUrls: ['./analytics-searches.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AnalyticsSearchesComponent implements OnInit {
    searches$: Observable<GetAnalyticsQueryDataQuery['searchAnalyticsQueryData']['rows']>;
    sorts$ = new BehaviorSubject<SearchAnalyticsSortInput[]>([
        { property: 'queryCount', order: SortOrder.DESC },
    ]);
    highlightFn: (row: GetAnalyticsQueryDataQuery['searchAnalyticsQueryData']['rows'][number]) => boolean =
        () => false;

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private parent: SearchAnalyticsComponent,
    ) {}

    ngOnInit() {
        this.searches$ = combineLatest(this.parent.dateRange$, this.sorts$).pipe(
            switchMap(([[start, end], sort]) =>
                this.dataService
                    .query<GetAnalyticsQueryDataQuery, GetAnalyticsQueryDataQueryVariables>(
                        GET_ANALYTICS_QUERY_DATA,
                        {
                            input: {
                                startDate: start,
                                endDate: end,
                                take: 25,
                                orderBy: sort,
                            },
                        },
                    )
                    .mapStream((data) => data.searchAnalyticsQueryData.rows)
                    .pipe(
                        tap(() => {
                            if (sort[0].property === 'hitCount' && sort[0].order === SortOrder.ASC) {
                                this.highlightFn = (row) => row.hitCount === 0;
                            } else if (sort[0].property === 'clickRate' && sort[0].order === SortOrder.ASC) {
                                this.highlightFn = (row) => row.clickRate === 0;
                            } else {
                                this.highlightFn = () => false;
                            }
                        }),
                    ),
            ),
        );
    }

    setSorts(sorts: SearchAnalyticsSortInput[]) {
        this.sorts$.next(sorts);
    }

    isPreset(sorts: SearchAnalyticsSortInput[], property: string, order: SortOrder): boolean {
        return sorts.findIndex((s) => s.property === property && s.order === order) === 0;
    }

    trackByTerm(index: number, item: GetAnalyticsQueryDataQuery['searchAnalyticsQueryData']['rows'][number]) {
        return item.query;
    }
}
