import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService, NotificationService, QueryResult } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';

import {
    DeleteSearchOverrideMutation,
    DeleteSearchOverrideMutationVariables,
    DeletionResult,
    GetSearchOverridesQuery,
    GetSearchOverridesQueryVariables,
    OverrideFragment,
    SearchOverrideInput,
    UpdateSearchOverrideMutation,
    UpdateSearchOverrideMutationVariables,
} from '../../generated-types';

import { DELETE_OVERRIDE, GET_OVERRIDES, UPDATE_OVERRIDE } from './curation.graphql';

@Component({
    selector: 'kb-curation',
    templateUrl: './curation.component.html',
    styleUrls: ['./curation.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CurationComponent implements OnInit {
    curations$: Observable<GetSearchOverridesQuery['searchOverrides']>;
    private curationsResult: QueryResult<GetSearchOverridesQuery>;

    constructor(protected dataService: DataService, private notificationService: NotificationService) {}

    ngOnInit() {
        this.curationsResult = this.dataService.query<GetSearchOverridesQuery>(GET_OVERRIDES);
        this.curations$ = this.curationsResult.mapStream((data) => data.searchOverrides);
    }

    trackByOverrideName(index: number, curation: GetSearchOverridesQuery['searchOverrides'][number]) {
        return curation.name;
    }

    removeInclude(curation: OverrideFragment, includeId: string) {
        const input: SearchOverrideInput = {
            ...curation,
            excludes: curation.excludes.map((e) => e.id),
            includes: curation.includes
                .filter((i) => i.id !== includeId)
                .map((i: any) => ({ id: i.id, position: i.position })),
        };
        this.dataService
            .mutate<UpdateSearchOverrideMutation, UpdateSearchOverrideMutationVariables>(UPDATE_OVERRIDE, {
                input,
            })
            .subscribe(() => {
                this.curationsResult.ref.refetch();
            });
    }

    removeExclude(curation: OverrideFragment, excludeId: string) {
        const input: SearchOverrideInput = {
            ...curation,
            excludes: curation.excludes.filter((e) => e.id !== excludeId).map((e) => e.id),
            includes: curation.includes.map((i: any) => ({ id: i.id, position: i.position })),
        };
        this.dataService
            .mutate<UpdateSearchOverrideMutation, UpdateSearchOverrideMutationVariables>(UPDATE_OVERRIDE, {
                input,
            })
            .subscribe(() => {
                this.curationsResult.ref.refetch();
            });
    }

    deleteCuration(name: string) {
        this.dataService
            .mutate<DeleteSearchOverrideMutation, DeleteSearchOverrideMutationVariables>(DELETE_OVERRIDE, {
                name,
            })
            .subscribe((result) => {
                if (result.deleteSearchOverride.result === DeletionResult.DELETED) {
                    this.notificationService.success('Deleted curation');
                    this.curationsResult.ref.refetch();
                }
            });
    }
}
