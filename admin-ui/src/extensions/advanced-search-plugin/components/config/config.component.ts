import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { DataService, ModalService, NotificationService } from '@vendure/admin-ui/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    GetSearchConfigQuery,
    GetSearchConfigQueryVariables,
    UpdateSearchConfigMutation,
    UpdateSearchConfigMutationVariables,
} from '../../generated-types';

import { GET_SEARCH_CONFIG, UPDATE_SEARCH_CONFIG } from './config.graphql';

const PRODUCT_COLLECTION_NAME = 'vendure_products';

type Weightings = { [attribute: string]: { enabled: boolean; weight: number; typoTolerance: number } };

@Component({
    selector: 'kb-search-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ConfigComponent implements OnInit, OnDestroy {
    searchableAttributes$: Observable<Array<{ name: string; label: string; isCustom: boolean }>>;
    weightings: Weightings = {};
    weightsModified = false;

    private subscription: Subscription;

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
    ) {}

    ngOnInit() {
        const productSearchConfig$ = this.dataService
            .query<GetSearchConfigQuery, GetSearchConfigQueryVariables>(GET_SEARCH_CONFIG, {
                collectionName: PRODUCT_COLLECTION_NAME,
            })
            .mapStream((data) => data.searchCollectionConfig ?? undefined);

        this.searchableAttributes$ = productSearchConfig$.pipe(
            map(
                (data) =>
                    data?.searchableAttributes.map(({ name }) => {
                        const isCustom = name.startsWith('customMapping_');
                        const label = isCustom ? name.split('customMapping_')[1] : name;
                        return { name, label, isCustom };
                    }) ?? [],
            ),
        );

        this.subscription = productSearchConfig$.subscribe((config) => {
            this.weightings = this.buildWeightings(config);
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    updateWeights() {
        const searchableAttributes = Object.entries(this.weightings).map(([attr, config]) => ({
            enabled: config.enabled,
            name: attr,
            weight: config.weight,
            typoTolerance: config.typoTolerance,
        }));
        this.dataService
            .mutate<UpdateSearchConfigMutation, UpdateSearchConfigMutationVariables>(UPDATE_SEARCH_CONFIG, {
                input: {
                    name: PRODUCT_COLLECTION_NAME,
                    searchableAttributes,
                },
            })
            .subscribe(() => {
                this.notificationService.success(`Successfully updated search weights`);
                this.weightsModified = false;
            });
    }

    private buildWeightings(config: GetSearchConfigQuery['searchCollectionConfig'] | undefined): Weightings {
        const weightings: Weightings = {};

        for (const attributeConfig of config?.searchableAttributes ?? []) {
            weightings[attributeConfig.name] = {
                enabled: attributeConfig.enabled,
                weight: attributeConfig.weight,
                typoTolerance: attributeConfig.typoTolerance,
            };
        }
        return weightings;
    }
}
