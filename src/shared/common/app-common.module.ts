import * as ngCommon from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModelBroweComponent } from './model-browe/model-browe.component';
// import { PdfBroweComponent } from './pdf-browe/pdf-browe.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ForgeModelComponent } from './forge-model/forge-model';

@NgModule({
  imports: [
    ngCommon.CommonModule,
    FormsModule,
    PdfViewerModule
  ],
  declarations: [
    ModelBroweComponent,
    ForgeModelComponent
    // PdfBroweComponent
  ],
  exports: [
    ModelBroweComponent,
    ForgeModelComponent
    // PdfBroweComponent
  ]
})
export class AppCommonModule {
}
