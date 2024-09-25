import { Desplegables } from "./desplegables.models";

export interface MapeoBusqueda {
    id: number;
    nombre: string;
    dependenciasAsociadas: string;
    tipoDependencia: string[];
    tipo: string;
}