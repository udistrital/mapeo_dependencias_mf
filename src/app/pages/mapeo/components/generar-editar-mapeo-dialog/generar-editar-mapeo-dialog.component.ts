import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { MapeoBusqueda } from './../../../../models/mapeo-busqueda.models'
import { OikosMidService } from './../../../../services/oikos_mid.service';

@Component({
  selector: 'app-generar-editar-mapeo-dialog',
  templateUrl: './generar-editar-mapeo-dialog.component.html',
  styleUrls: ['./generar-editar-mapeo-dialog.component.css']
})
export class GenerarEditarMapeoDialogComponent {
  tipo: string;
  element: MapeoBusqueda;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GenerarEditarMapeoDialogComponent>,
    private oikosmid: OikosMidService,
  ) {
    this.tipo = data.tipo;
    this.element = data.element;
  }
  

  onCloseClick(){
    this.dialogRef.close();
  }
}
