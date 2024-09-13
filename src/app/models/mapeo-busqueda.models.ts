import { Desplegables } from "./desplegables.models";

export interface MapeoBusqueda {
    id: number;
    nombre: string;
    telefono: string;
    correo: string;
    dependenciasAsociadas: Desplegables;
    tipoDependencia: Desplegables[];
    estado: string;
}