import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtml', pure: true })
export class StripHtmlPipe implements PipeTransform {
    transform(value: unknown): string {
        const str = typeof value === 'string' ? value : typeof value === 'number' ? value.toString() : '';
        return str.replace(/<\/?(p|br)>/g, ' ');
    }
}
