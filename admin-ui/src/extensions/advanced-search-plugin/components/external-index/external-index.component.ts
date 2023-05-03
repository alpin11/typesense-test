import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, ModalService, NotificationService } from '@vendure/admin-ui/core';
import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    filter,
    map,
    mapTo,
    mergeMap,
    shareReplay,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs/operators';

import {
    AdvancedSearchQuery,
    AdvancedSearchQueryVariables,
    ExternalIndexDefinition,
    GetExternalIndexesQuery,
    GetExternalIndexesQueryVariables,
    ReindexExternalMutation,
    ReindexExternalMutationVariables,
} from '../../generated-types';
import { GET_EXTERNAL_INDEXES } from '../indices/indices.graphql';

import { REINDEX_EXTERNAL } from './external-index.graphql';

interface ExternalSearchResponse {
    searchExternal: Array<{
        items: any[];
        totalItems: number;
        searchTimeMs: number;
    }>;
}

@Component({
    selector: 'kb-external-index',
    templateUrl: './external-index.component.html',
    styleUrls: ['./external-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ExternalIndexComponent implements OnInit, OnDestroy {
    term: FormControl;
    prefixMode = new FormControl(false);
    results$: Observable<any[]>;
    searchTerm$: Observable<string | null>;
    externalIndex$: Observable<ExternalIndexDefinition>;
    totalItems$: Observable<number>;
    searchTimeMs$: Observable<number>;
    paginationConfig$: Observable<{ currentPage: number; itemsPerPage: number; totalItems: number }>;
    private destroy$ = new Subject<void>();

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.searchTerm$ = this.route.queryParamMap.pipe(map((pm) => pm.get('q') ?? ''));
        const initialTerm = this.route.snapshot.queryParamMap.get('q') ?? '';
        const currentPage$ = this.route.queryParamMap.pipe(
            map((pm) => pm.get('p')),
            map((page) => (page != null ? +page : 1)),
        );
        const itemsPerPage$ = this.route.queryParamMap.pipe(
            map((pm) => pm.get('perPage')),
            map((perPage) => (perPage != null ? +perPage : 25)),
        );
        this.term = new FormControl(initialTerm);
        this.externalIndex$ = this.route.paramMap.pipe(
            map((pm) => pm.get('indexName')),
            switchMap((indexName) => {
                return this.dataService
                    .query<GetExternalIndexesQuery>(GET_EXTERNAL_INDEXES)
                    .mapStream(({ externalSearchIndexes }) => {
                        return externalSearchIndexes.find((i) => i.name === indexName);
                    });
            }),
            filter(notNullOrUndefined),
        );

        this.term.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe((term) => {
            this.router.navigate(['./'], {
                queryParams: { q: term },
                queryParamsHandling: 'merge',
                relativeTo: this.route,
            });
        });

        const result$ = combineLatest(
            this.externalIndex$,
            this.searchTerm$,
            this.prefixMode.valueChanges.pipe(startWith(false)),
            currentPage$,
            itemsPerPage$,
        ).pipe(
            switchMap(([externalIndex, term, prefixMode, currentPage, itemsPerPage]) => {
                return this.dataService
                    .query<ExternalSearchResponse>(this.buildQuery(externalIndex), {
                        input: {
                            indexes: [externalIndex.name],
                            term,
                            prefixMode,
                            skip: (currentPage - 1) * itemsPerPage,
                            take: itemsPerPage,
                        },
                    })
                    .mapSingle(({ searchExternal }) => searchExternal[0]);
            }),
            shareReplay(1),
        );
        this.results$ = result$.pipe(map((data) => data.items));
        this.totalItems$ = result$.pipe(map((data) => data.totalItems));
        this.searchTimeMs$ = result$.pipe(map((data) => data.searchTimeMs));
        this.paginationConfig$ = combineLatest(currentPage$, itemsPerPage$, this.totalItems$).pipe(
            map(([currentPage, itemsPerPage, totalItems]) => ({
                currentPage,
                itemsPerPage,
                totalItems,
            })),
        );
    }

    ngOnDestroy() {
        this.destroy$.next(undefined);
        this.destroy$.unsubscribe();
    }

    trackBySearchResult(index: number, item: AdvancedSearchQuery['search']['items'][number]) {
        return item.id;
    }

    setItemsPerPage(value: number) {
        this.router.navigate(['./'], {
            queryParams: { perPage: value, p: 1 },
            queryParamsHandling: 'merge',
            relativeTo: this.route,
        });
    }

    setCurrentPage(value: number) {
        this.router.navigate(['./'], {
            queryParams: { p: value },
            queryParamsHandling: 'merge',
            relativeTo: this.route,
        });
    }

    reindex() {
        this.externalIndex$
            .pipe(
                mergeMap((externalIndex) => {
                    return this.dataService
                        .mutate<ReindexExternalMutation, ReindexExternalMutationVariables>(REINDEX_EXTERNAL, {
                            names: [externalIndex.name],
                        })
                        .pipe(mapTo(externalIndex));
                }),
            )
            .subscribe((externalIndex) => {
                this.notificationService.success(`Started re-index of ${externalIndex.name}`);
            });
    }

    private buildQuery(externalIndex: ExternalIndexDefinition): DocumentNode {
        return gql`
            query SearchExternalIndex($input: ExternalSearchInput!) {
                searchExternal(input: $input) {
                    ...on ${externalIndex.responseTypeName} {
                totalItems
                searchTimeMs
                items {
                    ${externalIndex.fields.map((f) => f.name).join('\n')}
                    score
                    highlights {
                        field
                        snippet
                    }
                }
            }
            }
            }
        `;
    }
}
