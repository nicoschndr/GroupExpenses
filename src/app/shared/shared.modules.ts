import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DetailsPageComponent } from '../components/details-page/details-page.component';

/**
 * Import of this Module is needed to provide declared Pipes and Components
 */

@NgModule({
  declarations: [
    DetailsPageComponent,
  ],
  imports: [CommonModule, IonicModule, RouterModule],
  exports: [
    DetailsPageComponent,
  ]
})
export class SharedModule {}
