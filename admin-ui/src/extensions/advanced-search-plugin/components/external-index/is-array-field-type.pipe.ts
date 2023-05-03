import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'isArrayFieldType',
    pure: true,
})
export class isArrayFieldTypePipe implements PipeTransform {
    transform(value: string): boolean {
        return value.endsWith('[]');
    }
}
