import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapeoComponent } from './mapeo/mapeo.component'

const routes: Routes = [{
  path: '',
  children:[
    {
      path: 'mapeo',
      component: MapeoComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
