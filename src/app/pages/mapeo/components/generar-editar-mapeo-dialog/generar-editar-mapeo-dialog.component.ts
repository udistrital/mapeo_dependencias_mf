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
    this.tipo = data.tipo;
    this.element = data.element;
    this.cargarDatosMapeoDependencia();
  }
  

  cargarDatosMapeoDependencia(){
    this.MapeoForm.get('nombre')?.setValue(this.element.nombre);
    console.log("Id dependencia: " + String(this.element.nombre));
    //PRUEBA MANIPULACIÓN XML
    const xmlString = `<?xml version="1.0"?><response><name>John</name><age>30</age><city>New York</city></response>`;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const name = xmlDoc.getElementsByTagName("name")[0].textContent;
    const age = xmlDoc.getElementsByTagName("age")[0].textContent;
    const city = xmlDoc.getElementsByTagName("city")[0].textContent;
    console.log(`Name: ${name}, Age: ${age}, City: ${city}`);
    //FIN MANIPULACIÓN XML
    this.dependencias_service.get('mapeo_dependencia/'+this.element.idDependencia).subscribe((res:any)=>{
      console.log("OBJETO :" +JSON.stringify(res, null, 2));
    });
  }

  gestorAccionTipo(){
    if (this.tipo == "GENERAR"){
      this.creacionMapeoDependencia();
    }else{
      this.editarMapeoDependencia();
    }
  }

  crearObjetoMapeo(){
    const valoresForm = this.MapeoForm.value;
    let nomObjeto;
    if (this.tipo == "GENERAR"){
      return {
        _post_mapeo_dependencia:{
          id_master: valoresForm.numIdInterno,
          id_gedep:null,
          id_argo: valoresForm.idArgo,
          id_acad: valoresForm.codSnies,
          id_iris: valoresForm.codIris
        }
      }
    }else{
      return {
        _update_mapeo_dependencia_id_master:{
          id_master: valoresForm.numIdInterno,
          id_gedep:null,
          id_argo: valoresForm.idArgo,
          id_acad: valoresForm.codSnies,
          id_iris: valoresForm.codIris
        }
      }
    }
  }

  creacionMapeoDependencia(){
    console.log("CREO LA DEPENDENCIA");
    console.log("OBJETO :" +JSON.stringify(this.MapeoForm.value, null, 2));
    const objMapeo = this.crearObjetoMapeo();
    this.dependencias_service.post('mapeo_dependencia', objMapeo).pipe(
      tap((res:any)=>{
        if (res.Success){
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
    console.log("EDITO LA DEPENDENCIA");
    console.log("OBJETO :" +JSON.stringify(this.MapeoForm.value, null, 2));
    const objMapeo = this.crearObjetoMapeo();
    this.dependencias_service.put('mapeo_dependencia', objMapeo).pipe(
      tap((res:any)=>{
        if (res.Success){
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
