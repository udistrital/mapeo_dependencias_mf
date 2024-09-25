import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { MapeoBusqueda } from './../../../../models/mapeo-busqueda.models'
import { OikosMidService } from './../../../../services/oikos_mid.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Dependencias_service } from 'src/app/services/dependencias.service';
import { catchError, of, tap } from 'rxjs';
import { PopUpManager } from 'src/app/managers/popUpManager';

@Component({
  selector: 'app-generar-editar-mapeo-dialog',
  templateUrl: './generar-editar-mapeo-dialog.component.html',
  styleUrls: ['./generar-editar-mapeo-dialog.component.css']
})
export class GenerarEditarMapeoDialogComponent {
  tipo: string;
  id_gedep: string;
  element: MapeoBusqueda;

  MapeoForm = new FormGroup({
    nombre: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    idArgo: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    numIdInterno: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    codSnies: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    codIris: new FormControl<string | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
  })

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GenerarEditarMapeoDialogComponent>,
    private oikosmid: OikosMidService,
    private dependencias_service: Dependencias_service,
    private popUpManager: PopUpManager
  ) {
    this.id_gedep = '';
    this.tipo = data.tipo;
    this.element = data.element;
    this.cargarDatosMapeoDependencia();
  }
  

  cargarDatosMapeoDependencia(){
    this.MapeoForm.get('nombre')?.setValue(this.element.nombre);
    if (this.tipo != "GENERAR"){
      this.dependencias_service.get('mapeo_dependencia/'+this.element.idDependencia).subscribe((res:any)=>{
        let dataRes = res.mapeo_dependencias_pruebasCollection.mapeo_dependencias_pruebas;
        dataRes = dataRes[0];
        this.MapeoForm.controls['numIdInterno'].disable();
        this.MapeoForm.get('idArgo')?.setValue(dataRes.id_argo);
        this.MapeoForm.get('numIdInterno')?.setValue(dataRes.id_master);
        this.MapeoForm.get('codSnies')?.setValue(dataRes.id_acad);
        this.MapeoForm.get('codIris')?.setValue(dataRes.id_iris);
        if(dataRes.id_gedep == null){
          let temp = dataRes.id_argo;
          temp = temp.split("P");
          this.id_gedep = temp[1];
        }else{
          this.id_gedep = dataRes.id_gedep
        }
      });
    }
  }

  gestorAccionTipo(){
    if (this.tipo == "GENERAR"){
      this.creacionMapeoDependencia();
    }else{
      this.editarMapeoDependencia();
    }
  }

  crearObjetoMapeo(){
    this.MapeoForm.controls['numIdInterno'].enable();
    const valoresForm = this.MapeoForm.value;
    if(this.id_gedep == '' && valoresForm.idArgo){
      let temp: any = valoresForm.idArgo;
      temp = temp.split("P");
      this.id_gedep = temp[1];
    }else{
      this.id_gedep = this.id_gedep;
    }
    if (this.tipo == "GENERAR"){
      return {
        _postmapeo_dependencia:{
          id_master: Number(valoresForm.numIdInterno),
          id_gedep: Number(this.id_gedep),
          id_argo: valoresForm.idArgo,
          id_acad: Number(valoresForm.codSnies),
          id_iris: Number(valoresForm.codIris)
        }
      }
    }else{
      return {
        _putmapeo_dependencia_id_master:{
          id_master: Number(valoresForm.numIdInterno),
          id_gedep: Number(this.id_gedep),
          id_argo: valoresForm.idArgo,
          id_acad: Number(valoresForm.codSnies),
          id_iris: Number(valoresForm.codIris)
        }
      }
    }
  }

  creacionMapeoDependencia(){
    const objMapeo = this.crearObjetoMapeo();
    this.dependencias_service.post('mapeo_dependencia', objMapeo).pipe(
      tap((res:any)=>{
        if (res.mapeo_dependencias?.id_master){
          this.popUpManager.showSuccessAlert("Mapeo creado");
        } else{
          this.popUpManager.showErrorAlert("Error al crear mapeo");
        }
      }),
      catchError((error)=>{
        console.error('Error en la solicitud', error);
        this.popUpManager.showErrorAlert("Error al crear mapeo: "+ (error.message || 'Error desconocido'));
        return of(null);
      })
    ).subscribe();
    this.dialogRef.close();
  }

  editarMapeoDependencia(){
    const objMapeo = this.crearObjetoMapeo();
    this.dependencias_service.put('mapeo_dependencia/'+this.element.idDependencia, objMapeo).pipe(
      tap((res:any)=>{
        if (res.mapeo_dependencias?.id_master){
          this.popUpManager.showSuccessAlert("Mapeo editado");
        } else{
          this.popUpManager.showErrorAlert("Error al editar mapeo");
        }
      }),
      catchError((error)=>{
        console.error('Error en la solicitud', error);
        this.popUpManager.showErrorAlert("Error al editar mapeo: "+ (error.message || 'Error desconocido'));
        return of(null);
      })
    ).subscribe();
    this.dialogRef.close();
  }

  onCloseClick(){
    this.dialogRef.close();
  }
}
