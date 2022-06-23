import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'grouplist',
    loadChildren: () => import('./group/grouplist/grouplist.module').then( m => m.GrouplistPageModule)
  },
  {
    path: 'create-group',
    loadChildren: () => import('./group/create-group/create-group.module').then( m => m.CreateGroupPageModule)
  },
  {
    path: 'group-overview',
    loadChildren: () => import('./group/group-overview/group-overview.module').then( m => m.GroupOverviewPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
