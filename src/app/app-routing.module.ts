import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapeoComponent } from './pages/mapeo/mapeo.component';
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  {
    path: "mapeo",
    component: MapeoComponent
  },
  {
    path: "**",
    redirectTo: "registro"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/"}]
})
export class AppRoutingModule { }
