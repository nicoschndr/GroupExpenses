import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'grouplist',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'join-group',
    loadChildren: () => import('./join-group/join-group.module').then(m => m.JoinGroupPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path: 'forgot-pw',
    loadChildren: () => import('./forgot-pw/forgot-pw.module').then( m => m.ForgotPWPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'expenses',
    loadChildren: () => import('./expenses/expenses.module').then(m => m.ExpensesPageModule)
  },
  {
    path: 'expenses/:id',
    loadChildren: () => import('./expenses/expenses.module').then(m => m.ExpensesPageModule)
  },
  {
    path: 'grouplist',
    loadChildren: () => import('./grouplist/grouplist.module').then(m => m.GrouplistPageModule)
  },
  {
    path: 'create-group',
    loadChildren: () => import('./create-group/create-group.module').then(m => m.CreateGroupPageModule)
  },
  {
    path: 'group-overview',
    loadChildren: () => import('./group-overview/group-overview.module').then(m => m.GroupOverviewPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path: 'forgot-pw',
    loadChildren: () => import('./forgot-pw/forgot-pw.module').then( m => m.ForgotPWPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./group-overview/group-overview.module').then(m => m.GroupOverviewPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
