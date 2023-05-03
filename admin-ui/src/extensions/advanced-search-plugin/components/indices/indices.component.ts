import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';

import { GetExternalIndexesQuery } from '../../generated-types';

import { GET_EXTERNAL_INDEXES } from './indices.graphql';

@Component({
    selector: 'kb-indices',
    templateUrl: './indices.component.html',
    styleUrls: ['./indices.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class IndicesComponent implements OnInit {
    activeTab: string;
    externalIndexes$: Observable<GetExternalIndexesQuery['externalSearchIndexes']>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private dataService: DataService,
    ) {}

    ngOnInit() {
        const routePath = this.route.firstChild?.routeConfig?.path ?? '';
        if (routePath === 'external/:indexName') {
            this.activeTab = this.route.firstChild?.snapshot.paramMap.get('indexName') ?? '';
        } else {
            this.activeTab = routePath;
        }

        this.externalIndexes$ = this.dataService
            .query<GetExternalIndexesQuery>(GET_EXTERNAL_INDEXES)
            .mapStream(({ externalSearchIndexes }) => externalSearchIndexes);
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
}
