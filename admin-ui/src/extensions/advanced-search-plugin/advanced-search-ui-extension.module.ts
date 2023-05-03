import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection } from '@vendure/admin-ui/core';

@NgModule({
    imports: [SharedModule],
    providers: [
        addNavMenuSection(
            {
                id: 'advanced-search',
                label: 'Search',
                items: [
                    {
                        id: 'indices',
                        label: 'Indexes',
                        routerLink: ['/extensions/advanced-search/indexes/products'],
                        icon: 'search',
                    },
                    {
                        id: 'analytics',
                        label: 'Analytics',
                        routerLink: ['/extensions/advanced-search/analytics'],
                        icon: 'tick-chart',
                    },
                ],
            },
            'sales',
        ),
    ],
    exports: [],
})
export class AdvancedSearchUiExtensionModule {}
