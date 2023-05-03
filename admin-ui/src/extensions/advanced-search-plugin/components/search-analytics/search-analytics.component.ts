import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

@Component({
    selector: 'kb-search-analytics',
    templateUrl: './search-analytics.component.html',
    styleUrls: ['./search-analytics.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchAnalyticsComponent implements OnInit, OnDestroy {
    activeTab$: Observable<string>;
    dateRange$: Observable<[string, string]>;
    startDate = new FormControl();
    endDate = new FormControl();
    private subscription: Subscription;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location) {}

    ngOnInit() {
        const pathFromFirstChild = () => this.route.firstChild?.routeConfig?.path ?? '';
        this.activeTab$ = this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(pathFromFirstChild),
            startWith(pathFromFirstChild()),
            distinctUntilChanged(),
        );

        this.dateRange$ = this.route.queryParamMap.pipe(
            map((qpm) => [qpm.get('start') ?? '', qpm.get('end') ?? ''] as [string, string]),
            filter(([start, end]) => !!start && !!end),
        );

        this.subscription = combineLatest(
            this.startDate.valueChanges,
            this.endDate.valueChanges,
            this.activeTab$,
        )
            .pipe(filter(([start, end]) => !!start && !!end))
            .subscribe(([start, end, activeTab]) => {
                this.setQueryParam({ start, end }, activeTab);
            });

        const queryParamMap = this.route.snapshot.queryParamMap;
        const defaultStartDate = new Date();
        defaultStartDate.setDate(new Date().getDate() - 30);
        this.startDate.setValue(queryParamMap.get('start') ?? defaultStartDate.toISOString());
        this.endDate.setValue(queryParamMap.get('end') ?? new Date().toISOString());
    }

    navigateToTab(tabName: string) {
        this.location.replaceState(
            this.router
                .createUrlTree(['./', { ...this.route.snapshot.params, tab: tabName }], {
                    queryParamsHandling: 'merge',
                    relativeTo: this.route,
                })
                .toString(),
        );
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private setQueryParam(hash: { [key: string]: any }, activeTab: string) {
        this.router.navigate(['./' + activeTab], {
            queryParams: hash,
            relativeTo: this.route,
            queryParamsHandling: 'merge',
        });
    }
}
