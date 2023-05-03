import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SearchAnalyticsSortInput, SortOrder } from '../../generated-types';

@Component({
    selector: 'vdr-table-sort-toggle',
    templateUrl: `./table-sort.component.html`,
    styleUrls: [`./table-sort.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSortComponent {
    @Input() property: string;
    @Input() sorts: SearchAnalyticsSortInput[] = [];
    @Output() sortChange = new EventEmitter<SearchAnalyticsSortInput[]>();

    get isAsc(): boolean {
        return this.sorts.find((s) => s.property === this.property)?.order === SortOrder.ASC;
    }

    get isDesc(): boolean {
        return this.sorts.find((s) => s.property === this.property)?.order === SortOrder.DESC;
    }

    get isNone(): boolean {
        return !this.sorts.find((s) => s.property === this.property);
    }

    toggle() {
        if (this.isNone) {
            this.sortChange.emit([...this.sorts, { property: this.property, order: SortOrder.DESC }]);
        } else if (this.isDesc) {
            const index = this.sorts.findIndex((s) => s.property === this.property);
            if (-1 < index) {
                const newSorts = [...this.sorts];
                newSorts.splice(index, 1, {
                    property: this.property,
                    order: SortOrder.ASC,
                });
                this.sortChange.emit(newSorts);
            }
        } else {
            const index = this.sorts.findIndex((s) => s.property === this.property);
            if (-1 < index) {
                const newSorts = [...this.sorts];
                newSorts.splice(index, 1);
                this.sortChange.emit(newSorts);
            }
        }
    }
}
