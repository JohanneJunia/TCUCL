import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { BatimentResultat } from '../../../models/batiment-resultat.model';
import {ApiEndpoints} from '../../../services/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class BatimentsService {
  constructor(private http: HttpClient) {}

  getBatimentImmobilisationMobilier(BatimentsOnglet: string, headers: any): Observable<any> {
    return this.http.get<any>(ApiEndpoints.BatimentsOnglet.getBatimentImmobilisationMobilier(BatimentsOnglet), { headers });
  }

  ajouterBatiment(BatimentsOnglet: string, batiment: any, headers: any): Observable<any> {
    return this.http.post(ApiEndpoints.BatimentsOnglet.ajouterBatiment(BatimentsOnglet), batiment, { headers });
  }

  ajouterEntretien(BatimentsOnglet: string, entretien: any, headers: any): Observable<any> {
    return this.http.post(ApiEndpoints.BatimentsOnglet.ajouterEntretien(BatimentsOnglet), entretien, { headers });
  }

  ajouterMobilier(BatimentsOnglet: string, mobilier: any, headers: any): Observable<any> {
    return this.http.post(ApiEndpoints.BatimentsOnglet.ajouterMobilier(BatimentsOnglet), mobilier, { headers });
  }

  supprimerBatiment(BatimentsOnglet: string, batimentId: number, headers: any): Observable<any> {
    return this.http.delete(ApiEndpoints.BatimentsOnglet.supprimerBatiment(BatimentsOnglet, batimentId), { headers });
  }

  supprimerEntretien(BatimentsOnglet: string, entretienId: number, headers: any): Observable<any> {
    return this.http.delete(ApiEndpoints.BatimentsOnglet.supprimerEntretien(BatimentsOnglet, entretienId), { headers });
  }

  supprimerMobilier(BatimentsOnglet: string, mobilierId: number, headers: any): Observable<any> {
    return this.http.delete(ApiEndpoints.BatimentsOnglet.supprimerMobilier(BatimentsOnglet, mobilierId), { headers });
  }

  updateOnglet(BatimentsOnglet: string, payload: any, headers: any): Observable<any> {
    return this.http.patch(ApiEndpoints.BatimentsOnglet.update(BatimentsOnglet), payload, { headers });
  }

  chargerResultatGES(id: string, headers: any): Observable<BatimentResultat> {
    return this.http.get<BatimentResultat>(ApiEndpoints.BatimentsOnglet.resultats(id), {headers});
  }
}
