import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace', pure: true })
export class ReplacePipe implements PipeTransform {
    transform(value: unknown, find: string, replace: string): string {
        const str = typeof value === 'string' ? value : '';
        return str.replace(find, replace);
    }
}
