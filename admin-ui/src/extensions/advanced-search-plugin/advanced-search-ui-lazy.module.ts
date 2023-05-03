import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';

import { AnalyticsOverviewComponent } from './components/analytics-overview/analytics-overview.component';
import { AnalyticsSearchesComponent } from './components/analytics-searches/analytics-searches.component';
import { ChartComponent } from './components/chart/chart.component';
import { ConfigComponent } from './components/config/config.component';
import { CurateResultDialogComponent } from './components/curate-result-dialog/curate-result-dialog.component';
import { CurationComponent } from './components/curation/curation.component';
import { ExternalIndexComponent } from './components/external-index/external-index.component';
import { isArrayFieldTypePipe } from './components/external-index/is-array-field-type.pipe';
import { IndicesComponent } from './components/indices/indices.component';
import { SearchAnalyticsComponent } from './components/search-analytics/search-analytics.component';
import { SearchIndexComponent } from './components/search-index/search-index.component';
import { SynonymDialogComponent } from './components/synonym-dialog/synonym-dialog.component';
import { SynonymsComponent } from './components/synonyms/synonyms.component';
import { TableSortComponent } from './components/table-sort/table-sort.component';
import { StripHtmlPipe } from './pipes/strip-html.pipe';
import { ReplacePipe } from './pipes/replace.pipe';

@NgModule({
    imports: [
        SharedModule,
        NgxPaginationModule,
        RouterModule.forChild([
            {
                path: 'indexes',
                component: IndicesComponent,
                data: {
                    breadcrumb: [
                        {
                            label: 'Search Indexes',
                            link: ['/indexes'],
                        },
                    ],
                },
                children: [
                    {
                        path: 'products',
                        component: SearchIndexComponent,
                    },
                    {
                        path: 'external/:indexName',
                        component: ExternalIndexComponent,
                    },
                    {
                        path: 'config',
                        component: ConfigComponent,
                    },
                    {
                        path: 'curation',
                        component: CurationComponent,
                    },
                    {
                        path: 'synonyms',
                        component: SynonymsComponent,
                    },
                ],
            },
            {
                path: 'analytics',
                component: SearchAnalyticsComponent,
                data: {
                    breadcrumb: [
                        {
                            label: 'Search Analytics',
                            link: ['/analytics', 'analytics'],
                        },
                    ],
                },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: AnalyticsOverviewComponent,
                    },
                    {
                        path: 'searches',
                        component: AnalyticsSearchesComponent,
                    },
                ],
            },
        ]),
    ],
    declarations: [
        SearchAnalyticsComponent,
        SearchIndexComponent,
        CurationComponent,
        CurateResultDialogComponent,
        SynonymDialogComponent,
        StripHtmlPipe,
        IndicesComponent,
        SynonymsComponent,
        ConfigComponent,
        AnalyticsOverviewComponent,
        AnalyticsSearchesComponent,
        ChartComponent,
        TableSortComponent,
        ExternalIndexComponent,
        isArrayFieldTypePipe,
        ReplacePipe,
    ],
    providers: [],
})
export class AdvancedSearchUiLazyModule {}
