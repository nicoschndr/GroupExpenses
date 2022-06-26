import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotPWPage } from './forgot-pw.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotPWPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotPWPageRoutingModule {}
