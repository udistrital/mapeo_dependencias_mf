import { AfterViewInit, Component, Input, ViewChild, signal} from '@angular/core';
import { MapeoBusqueda } from './../../models/mapeo-busqueda.models'
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { GenerarEditarMapeoDialogComponent } from './components/generar-editar-mapeo-dialog/generar-editar-mapeo-dialog.component'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Desplegables } from 'src/app/models/desplegables.models';
import { OikosService } from '../../services/oikos.service';
import { OikosMidService } from '../../services/oikos_mid.service';
import { PopUpManager } from '../../managers/popUpManager'
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mapeo',
  templateUrl: './mapeo.component.html',
  styleUrls: ['./mapeo.component.css']
})
export class MapeoComponent {
  @Input('normalform') normalform: any;
  @ViewChild(MatPaginator) paginator !: MatPaginator;
  
  tiposDependencia: Desplegables[] = [];
  facultades: Desplegables[] = [];
  vicerrectorias: Desplegables[] = [];
  mostrarTabla: boolean = false;
  cargando: boolean = false; // <-- Variable para el loader
  columnasBusqueda = signal<string[]>(["NOMBRE","DEPENDENCIA ASOCIADAS","TIPO","ACCIONES"]);
  gestionForm !:  FormGroup;
  elementosBusqueda = signal<MapeoBusqueda[]>([]);
  datos = new MatTableDataSource<MapeoBusqueda>();

  

  constructor(
    private oikosService: OikosService,
    public dialog: MatDialog,
    private oikosMidService: OikosMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    translate.setDefaultLang('es');
    this.cargarTiposDependencia();
    this.cargarFacultades();
    this.cargarVicerrectorias();
  }

  ngOnInit() {
    this.iniciarFormularioConsulta();
    this.gestionForm.get('facultad')?.valueChanges.subscribe((selectedFacultad) => {
      if (selectedFacultad) {
        this.gestionForm.get('vicerrectoria')?.setValue(null);
        this.gestionForm.get('tipoDependencia')?.setValue(null);
      }
    });
    this.gestionForm.get('vicerrectoria')?.valueChanges.subscribe((selectedVicerrectoria) => {
      if (selectedVicerrectoria) {
        this.gestionForm.get('facultad')?.setValue(null);
        this.gestionForm.get('tipoDependencia')?.setValue(null);
      }
    });
    this.gestionForm.get('tipoDependencia')?.valueChanges.subscribe((selectedTipoDependencia) => {
      if (selectedTipoDependencia) {
        this.gestionForm.get('facultad')?.setValue(null);
        this.gestionForm.get('vicerrectoria')?.setValue(null);
      }
    });
  }

  ngAfterViewInit(){
    this.datos.paginator = this.paginator;
  }

  iniciarFormularioConsulta(){
    this.gestionForm = new FormGroup({
      nombre: new FormControl("", {
        nonNullable: false,
        validators: [Validators.required]
      }),
      tipoDependencia: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      facultad: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      vicerrectoria: new FormControl<Desplegables | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
      estado: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [Validators.required]
      }),
    });
  }


  cargarTiposDependencia() {
    this.oikosService.get('tipo_dependencia?limit=-1').subscribe((res: any) => {
      this.tiposDependencia = res.map((item: any) => ({
        id: item.Id,
        nombre: item.Nombre
      }));
    });
  }

  cargarFacultades() {
    this.oikosService.get('dependencia?limit=-1').subscribe((res: any) => {
      this.facultades = res.filter((item: any) =>
        item.DependenciaTipoDependencia &&
        item.DependenciaTipoDependencia.some((tipoDependencia: any) =>
          tipoDependencia.TipoDependenciaId.Nombre === 'FACULTAD'
        )
      )
        .map((item: any) => ({
          id: item.Id,
          nombre: item.Nombre
        }));
    });
  }

  cargarVicerrectorias() {
    this.oikosService.get('dependencia?limit=-1').subscribe((res: any) => {
      this.vicerrectorias = res.filter((item: any) =>
        item.DependenciaTipoDependencia &&
        item.DependenciaTipoDependencia.some((tipoDependencia: any) =>
          tipoDependencia.TipoDependenciaId.Nombre === 'VICERRECTORIA'
        )
      )
        .map((item: any) => ({
          id: item.Id,
          nombre: item.Nombre
        }));
    });
  }

  abrirDialogGenerarEditarMapeo(tipo: string, element:MapeoBusqueda){
    const dialogRef = this.dialog.open(GenerarEditarMapeoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data:{
        tipo:tipo,
        element:element,
      }
    });
  }

  construirBusqueda() {
    const busqueda: any = {};

    if (this.gestionForm.value.nombre) {
      busqueda.NombreDependencia = this.gestionForm.value.nombre;
    }

    if (this.gestionForm.value.tipoDependencia?.id) {
      busqueda.TipoDependenciaId = this.gestionForm.value.tipoDependencia.id;
    }

    if (this.gestionForm.value.facultad?.id) {
      busqueda.FacultadId = this.gestionForm.value.facultad.id;
    }

    if (this.gestionForm.value.vicerrectoria?.id) {
      busqueda.VicerrectoriaId = this.gestionForm.value.vicerrectoria.id;
    }

    if (this.gestionForm.value.estado !== '...') {
      busqueda.BusquedaEstado = {
        Estado: this.gestionForm.value.estado === "ACTIVO"
      };
    }

    return busqueda;
  }

   buscarDependencias() {
    const busqueda = this.construirBusqueda();  
    console.log(busqueda)
    this.popUpManager.showLoaderAlert();
    this.mostrarTabla = false;  

    this.oikosMidService.post("gestion_dependencias_mid/BuscarDependencia", busqueda).pipe(
      tap((res: any) => {
        if (res && res.Data) {
          const datosTransformados = res.Data.map((item: any) => ({
            id: item.Dependencia.Id,
            nombre: item.Dependencia.Nombre,
            telefono: item.Dependencia.TelefonoDependencia,
            correo: item.Dependencia.CorreoElectronico,
            dependenciasAsociadas: {
              id: item.DependenciaAsociada.Id,          
              nombre: item.DependenciaAsociada.Nombre
            },
            tipoDependencia: item.TipoDependencia.map((tipo: any) => ({
              id: tipo.Id,          
              nombre: tipo.Nombre   
            })),
            estado: item.Estado ? 'ACTIVA' : 'NO ACTIVA',
          }));
          
          this.datos = new MatTableDataSource<MapeoBusqueda>(datosTransformados);
          setTimeout(() => { this.datos.paginator = this.paginator; }, 1000);
          
          Swal.close();
          this.popUpManager.showSuccessAlert(this.translate.instant('EXITO.BUSQUEDA'));
          this.mostrarTabla = true;  
        } else {
          Swal.close();
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.DATOS'));
          this.mostrarTabla = false;
        }
      }),
      catchError((error) => {
        Swal.close();
        this.popUpManager.showErrorAlert(this.translate.instant('ERROR.BUSQUEDA.BUSQUEDA') + (error.message || 'Error desconocido'));
        console.error('Error al buscar dependencias:', error);
        this.mostrarTabla = false;
        return of(null);  
      })
    ).subscribe();
}

  
}
