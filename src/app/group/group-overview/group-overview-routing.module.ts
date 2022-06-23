import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupOverviewPage } from './group-overview.page';

const routes: Routes = [
  {
    path: '',
    component: GroupOverviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupOverviewPageRoutingModule {}
