import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, ModalService, NotificationService } from '@vendure/admin-ui/core';
import { combineLatest, EMPTY, Observable, of, Subject } from 'rxjs';
import { debounceTime, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';

import {
    AdvancedSearchQuery,
    AdvancedSearchQueryVariables,
    CreateSearchOverrideMutation,
    CreateSearchOverrideMutationVariables,
    GetSearchOverrideQuery,
    GetSearchOverrideQueryVariables,
    OverrideFragment,
} from '../../generated-types';
import { CurateResultDialogComponent } from '../curate-result-dialog/curate-result-dialog.component';
import { GET_OVERRIDE } from '../curation/curation.graphql';

import { ADVANCED_SEARCH, CREATE_OVERRIDE } from './search-index.graphql';

@Component({
    selector: 'kb-search-index',
    templateUrl: './search-index.component.html',
    styleUrls: ['./search-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class SearchIndexComponent implements OnInit, OnDestroy {
    term: FormControl;
    groupByProduct = new FormControl(true);
    prefixMode = new FormControl(false);
    paginationConfig$: Observable<{ currentPage: number; itemsPerPage: number; totalItems: number }>;
    searchTerm$: Observable<string | null>;
    results$: Observable<AdvancedSearchQuery['search']['items']>;
    facetValues$: Observable<AdvancedSearchQuery['search']['facetValues']>;
    collections$: Observable<AdvancedSearchQuery['search']['collections']>;
    searchTimeMs$: Observable<number>;
    totalItems$: Observable<number>;
    private destroy$ = new Subject<void>();

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        const initialTerm = this.route.snapshot.queryParamMap.get('q') ?? '';
        this.term = new FormControl(initialTerm);

        this.searchTerm$ = this.route.queryParamMap.pipe(map((pm) => pm.get('q')));
        const currentPage$ = this.route.queryParamMap.pipe(
            map((pm) => pm.get('p')),
            map((page) => (page != null ? +page : 1)),
        );
        const itemsPerPage$ = this.route.queryParamMap.pipe(
            map((pm) => pm.get('perPage')),
            map((perPage) => (perPage != null ? +perPage : 25)),
        );

        this.term.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe((term) => {
            this.router.navigate(['./'], {
                queryParams: { q: term },
                queryParamsHandling: 'merge',
                relativeTo: this.route,
            });
        });

        const searchResponse$ = combineLatest(
            this.searchTerm$,
            this.groupByProduct.valueChanges.pipe(startWith(true)),
            this.prefixMode.valueChanges.pipe(startWith(false)),
            currentPage$,
            itemsPerPage$,
        ).pipe(
            switchMap(([term, groupByProduct, prefixMode, currentPage, itemsPerPage]) => {
                if (term) {
                    return this.dataService.query<AdvancedSearchQuery, AdvancedSearchQueryVariables>(
                        ADVANCED_SEARCH,
                        {
                            input: {
                                term,
                                groupByProduct,
                                applyCurations: true,
                                logAnalytics: false,
                                skip: (currentPage - 1) * itemsPerPage,
                                take: itemsPerPage,
                                prefixMode,
                            },
                        },
                    ).single$;
                } else {
                    return of({
                        search: {
                            items: [],
                            facetValues: [],
                            collections: [],
                            totalItems: 0,
                            searchTimeMs: 0,
                        },
                    });
                }
            }),
            map((result) => result.search),
            shareReplay(1),
        );

        this.results$ = searchResponse$.pipe(map((res) => res.items));
        this.facetValues$ = searchResponse$.pipe(map((res) => res.facetValues));
        this.collections$ = searchResponse$.pipe(map((res) => res.collections));
        this.totalItems$ = searchResponse$.pipe(map((res) => res.totalItems));
        this.searchTimeMs$ = searchResponse$.pipe(map((res) => res.searchTimeMs));
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

    trackByOverrideName(index: number, item: OverrideFragment) {
        return item.name;
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

    curateResult(document: AdvancedSearchQuery['search']['items'][number]) {
        this.modalService
            .fromComponent(CurateResultDialogComponent, {
                locals: {
                    searchTerm: this.term.value,
                    document,
                },
            })
            .pipe(
                switchMap((result) => {
                    if (result) {
                        return this.dataService
                            .query<GetSearchOverrideQuery, GetSearchOverrideQueryVariables>(GET_OVERRIDE, {
                                name: result.name,
                            })
                            .mapSingle(({ searchOverride }) => [result, searchOverride] as const);
                    } else {
                        return EMPTY;
                    }
                }),
                switchMap(([input, existing]) => {
                    if (input && existing) {
                        input.includes.push(
                            ...(existing.includes.map((i) => ({ id: i.id, position: i.position })) || []),
                        );
                        input.excludes.push(...(existing.excludes || []).map((e: any) => e.id));
                    }
                    return this.dataService.mutate<
                        CreateSearchOverrideMutation,
                        CreateSearchOverrideMutationVariables
                    >(CREATE_OVERRIDE, {
                        input,
                    });
                }),
            )
            .subscribe((result) => {
                this.notificationService.success('Created search curation');
            });
    }
}
