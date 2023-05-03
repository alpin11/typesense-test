import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService, Dialog } from '@vendure/admin-ui/core';
import { Subscription } from 'rxjs';

import { AdvancedSearchQuery, SearchOverrideInput } from '../../generated-types';

@Component({
    selector: 'kb-curate-result-dialog',
    templateUrl: './curate-result-dialog.component.html',
    styleUrls: ['./curate-result-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurateResultDialogComponent implements Dialog<SearchOverrideInput>, OnInit, OnDestroy {
    resolveWith: (result?: SearchOverrideInput) => void;
    form: FormGroup;

    searchTerm: string;
    document: AdvancedSearchQuery['search']['items'][number];
    private subscription: Subscription | undefined;

    constructor(private dataService: DataService) {}

    ngOnInit() {
        this.form = new FormGroup({
            match: new FormControl('exact'),
            term: new FormControl(this.searchTerm, { validators: [Validators.required] }),
            action: new FormControl('include'),
            position: new FormControl(1),
        });

        this.subscription = this.form.get('action')?.valueChanges.subscribe((action) => {
            const positionControl = this.form.get('position');
            if (positionControl) {
                if (action === 'include') {
                    positionControl.enable();
                } else {
                    positionControl.disable();
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    cancel() {
        this.resolveWith();
    }

    submit() {
        const formValue = this.form.value;
        const name = this.buildOverrideName();
        const result: SearchOverrideInput = {
            name,
            query: formValue.term,
            exactMatch: formValue.match === 'exact',
            excludes: formValue.action === 'exclude' ? [this.document.id] : [],
            includes:
                formValue.action === 'include'
                    ? [{ id: this.document.id, position: formValue.position }]
                    : [],
        };
        this.resolveWith(result);
    }

    private buildOverrideName(): string {
        const formValue = this.form.value;
        const prefix = formValue.match === 'exact' ? 'matches' : 'contains';
        const name = formValue.term.replace(/\s/g, '-');
        return `${prefix}-${name}`;
    }
}
