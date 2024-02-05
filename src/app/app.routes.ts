import { Routes } from '@angular/router';
import { EditPageComponent } from './edit-page/edit-page.component';
import { MainPageComponent } from './main-page/main-page.component';

export const routes: Routes = [
  { path: 'main', component: MainPageComponent },
  { path: 'edit', component: EditPageComponent },
  { path: "", redirectTo: 'main', pathMatch: 'full' },
];
