import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedSearchUiExtensionModule } from './extensions/advanced-search-plugin/advanced-search-ui-extension.module';


@NgModule({
    imports: [CommonModule, AdvancedSearchUiExtensionModule],
})
export class SharedExtensionsModule {}
