import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgotPWPageRoutingModule } from './forgot-pw-routing.module';

import { ForgotPWPage } from './forgot-pw.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgotPWPageRoutingModule
  ],
  declarations: [ForgotPWPage]
})
export class ForgotPWPageModule {}
