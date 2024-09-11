import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorManager } from './errorManager'

/**
 * This class manage the http connections with internal REST services. Use the response format {
 *  Code: 'xxxxx',
 *  Body: 'Some Data' (this element is returned if the request is success)
 *  ...
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RequestManager {
  private path!: any;
  public httpOptions: any;
  constructor(private http: HttpClient, private errManager: HttpErrorManager) {
    const acces_token = window.localStorage.getItem('access_token');
    if (acces_token !== null) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/xml, text/plain',
          'Authorization': `Bearer ${acces_token}`,
        }),
      }
      const headers = this.httpOptions.headers.keys().map((key:string) => ({ [key]: this.httpOptions.headers.get(key) }));
      console.log("CREACION HTTP HEADER:", headers);
    }
  }


  /**
   * Use for set the source path of the service (service's name must be present at src/environment/environment.ts)
   * @param service: string
   */
  public setPath(service: string) {
    this.path = environment[service as keyof typeof environment];
  }


  /**
   * Perform a GET http request
   * @param endpoint service's end-point
   * @param params (an Key, Value object with que query params for the request)
   * @returns Observable<any>
   */
  /*
  get(endpoint: any) {
    const headers = this.httpOptions.headers.keys().map((key:string) => ({ [key]: this.httpOptions.headers.get(key) }));
    console.log("HTTP HEADER:", headers);
    return this.http.get<any>(`${this.path}${endpoint}`, this.httpOptions).pipe(
      map(
        (res) => {
          if (res.hasOwnProperty('Body')) {
            return res;
          } else {
            return res;
          }
        },
      ),
      catchError(this.errManager.handleError.bind(this)),
    );
  }*/
  //INICIO PRUEBA RECEPCIÓN RESPUESTAS DInÄMICAS
    get(endpoint: any) {
      return this.http.get(`${this.path}${endpoint}`, { ...this.httpOptions, responseType: 'arraybuffer' }).pipe(
        map((response: ArrayBuffer) => {
          
          const text = new TextDecoder().decode(response);
          if (this.isXML(text)) {
            return this.parseXML(text);  
          } else {
            return JSON.parse(text); 
          }
        }),
        catchError(error => {
          console.error('Error en la solicitud:', error);
          return this.errManager.handleError(error); 
        }),
      );
    }
  

    private isXML(response: string): boolean {
      return response.startsWith('<') && response.includes('<?xml');
    }

    private parseXML(xmlString: string) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlString, 'application/xml');
      return this.xmlToJson(xml);
    }
  
    
    private xmlToJson(xml: any): any {
      let obj: any = {};
  
      if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
          obj["@attributes"] = {};
          for (let j = 0; j < xml.attributes.length; j++) {
            const attribute = xml.attributes.item(j);
            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
          }
        }
      } else if (xml.nodeType === 3) {
        obj = xml.nodeValue;
      }
  
      if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
          const item = xml.childNodes.item(i);
          const nodeName = item.nodeName;
          if (typeof obj[nodeName] === "undefined") {
            obj[nodeName] = this.xmlToJson(item);
          } else {
            if (typeof obj[nodeName].push === "undefined") {
              const old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(this.xmlToJson(item));
          }
        }
      }
  
      return obj;
    }
// FIN PRUEBA DE RECEPCION DINAMICA DE RESPUESTAS
  /**
   * Perform a POST http request
   * @param endpoint service's end-point
   * @param element data to send as JSON
   * @returns Observable<any>
   */
  post(endpoint: any, element: any) {
    return this.http.post<any>(`${this.path}${endpoint}`, element, this.httpOptions).pipe(
      catchError(this.errManager.handleError),
    );
  }

  /**
   * Perform a POST http request
   * @param endpoint service's end-point
   * @param element data to send as JSON
   * @returns Observable<any>
   */
  post_file(endpoint: any, element: any) {
    return this.http.post<any>(`${this.path}${endpoint}`, element, {    headers: new HttpHeaders({
      'Content-Type': 'multipart/form-data',
  })}).pipe(
      catchError(this.errManager.handleError),
    );
  }

  /**
   * Perform a PUT http request
   * @param endpoint service's end-point
   * @param element data to send as JSON, With the id to UPDATE
   * @returns Observable<any>
   */
  put(endpoint: any, element: { Id: any; }) {
    const path = (element.Id) ? `${this.path}${endpoint}/${element.Id}` : `${this.path}${endpoint}`;
    return this.http.put<any>(path, element, this.httpOptions).pipe(
      catchError(this.errManager.handleError),
    );
  }

  /**
   * Perform a DELETE http request
   * @param endpoint service's end-point
   * @param id element's id for remove
   * @returns Observable<any>
   */
  delete(endpoint: any, id: any) {
    return this.http.delete<any>(`${this.path}${endpoint}/${id}`, this.httpOptions).pipe(
      catchError(this.errManager.handleError),
    );
  }
};