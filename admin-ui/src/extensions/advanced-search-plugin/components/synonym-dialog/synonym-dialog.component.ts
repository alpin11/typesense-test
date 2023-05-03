import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService, Dialog } from '@vendure/admin-ui/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { SearchSynonymInput, SynonymFragment } from '../../generated-types';

@Component({
    selector: 'kb-synonym-dialog',
    templateUrl: './synonym-dialog.component.html',
    styleUrls: ['./synonym-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SynonymDialogComponent implements Dialog<SearchSynonymInput>, OnInit, OnDestroy {
    resolveWith: (result?: SearchSynonymInput) => void;
    form: FormGroup;

    synonym: SynonymFragment | undefined;

    private subscription: Subscription | undefined;

    constructor(private dataService: DataService) {}

    ngOnInit() {
        this.form = new FormGroup({
            synonyms: new FormControl(this.synonym?.synonyms ?? []),
            root: new FormControl(this.synonym?.root ?? '', Validators.required),
            oneWay: new FormControl(!!this.synonym?.root ?? false),
        });

        this.subscription = this.form
            .get('oneWay')
            ?.valueChanges.pipe(startWith(false))
            .subscribe((oneWay: boolean) => {
                const rootControl = this.form.get('root');
                if (rootControl) {
                    if (oneWay) {
                        rootControl.enable();
                    } else {
                        rootControl.disable();
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
        const name = this.synonym?.name ?? this.buildSynonymName();
        const result: SearchSynonymInput = {
            name,
            root: formValue.root,
            synonyms: formValue.synonyms,
        };
        this.resolveWith(result);
    }

    private buildSynonymName(): string {
        const formValue = this.form.value;
        const name = [formValue.root, ...formValue.synonyms].join('-');
        const suffix = Math.random().toString(36).substr(8);
        return `${name}-${suffix}`;
    }
}
