import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataService, ModalService, NotificationService, QueryResult } from '@vendure/admin-ui/core';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import {
    CreateSynonymMutation,
    CreateSynonymMutationVariables,
    DeleteSynonymMutation,
    DeleteSynonymMutationVariables,
    DeletionResult,
    GetSynonymsQuery,
    UpdateSynonymMutation,
    UpdateSynonymMutationVariables,
} from '../../generated-types';
import { SynonymDialogComponent } from '../synonym-dialog/synonym-dialog.component';

import { CREATE_SYNONYM, DELETE_SYNONYM, GET_SYNONYMS, UPDATE_SYNONYM } from './synonyms.graphql';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'kb-synonyms',
    templateUrl: './synonyms.component.html',
    styleUrls: ['./synonyms.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class SynonymsComponent implements OnInit {
    termControl = new FormControl('');
    synonyms$: Observable<GetSynonymsQuery['searchSynonyms']>;
    private synonymsResult: QueryResult<GetSynonymsQuery>;

    constructor(
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
    ) {}

    ngOnInit() {
        this.synonymsResult = this.dataService.query<GetSynonymsQuery>(GET_SYNONYMS);
        this.synonyms$ = combineLatest(
            this.synonymsResult.mapStream((data) => data.searchSynonyms),
            this.termControl.valueChanges.pipe(startWith('')),
        ).pipe(
            map(([results, term]) => {
                if (!term) {
                    return results;
                } else {
                    return results.filter((r) => !!r.synonyms.find((s) => s.includes(term)));
                }
            }),
        );
    }

    addSynonym() {
        this.modalService
            .fromComponent(SynonymDialogComponent)
            .pipe(
                switchMap((result) => {
                    if (result) {
                        return this.dataService.mutate<CreateSynonymMutation, CreateSynonymMutationVariables>(
                            CREATE_SYNONYM,
                            {
                                input: result,
                            },
                        );
                    } else {
                        return EMPTY;
                    }
                }),
            )
            .subscribe(() => {
                this.notificationService.success('Synonym created');
                this.synonymsResult.ref.refetch();
            });
    }

    editSynonym(synonym: GetSynonymsQuery['searchSynonyms'][number]) {
        this.modalService
            .fromComponent(SynonymDialogComponent, {
                locals: {
                    synonym,
                },
            })
            .pipe(
                switchMap((result) => {
                    if (result) {
                        return this.dataService.mutate<UpdateSynonymMutation, UpdateSynonymMutationVariables>(
                            UPDATE_SYNONYM,
                            {
                                input: result,
                            },
                        );
                    } else {
                        return EMPTY;
                    }
                }),
            )
            .subscribe(() => {
                this.notificationService.success('Synonym updated');
                this.synonymsResult.ref.refetch();
            });
    }

    deleteSynonym(synonym: GetSynonymsQuery['searchSynonyms'][number]) {
        this.dataService
            .mutate<DeleteSynonymMutation, DeleteSynonymMutationVariables>(DELETE_SYNONYM, {
                name: synonym.name,
            })
            .subscribe((result) => {
                if (result.deleteSearchSynonym.result === DeletionResult.DELETED) {
                    this.notificationService.success('Deleted synonym');
                    this.synonymsResult.ref.refetch();
                }
            });
    }
}
