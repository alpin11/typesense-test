export const extensionRoutes = [  {
    path: 'extensions/advanced-search',
    loadChildren: () => import('./extensions/advanced-search-plugin/advanced-search-ui-lazy.module').then(m => m.AdvancedSearchUiLazyModule),
  }];
