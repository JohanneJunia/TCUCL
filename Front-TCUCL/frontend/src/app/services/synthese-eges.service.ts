import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from './api-endpoints';
import { AuthService } from './auth.service';

export interface SyntheseEgesResult {
  emissionFugitivesGlobal: number | null;
  energieGlobal: number | null;
  mobiliteDomicileTravailGlobal: number | null;
  autreMobiliteFrGlobal: number | null;
  mobiliteInternationalGlobal: number | null;
  batimentParkingGlobal: number | null;
  numeriqueGlobal: number | null;
  autreImmobilisationGlobal: number | null;
  achatGlobal: number | null;
  dechetGlobal: number | null;
  bilanCarboneTotalGlobal: number | null;
  /** Sum of scope/poste values returned by the API */
  bilanCarboneTotalScope?: number | null;
  /** Scope/poste values */
  emissionDirecteCombustion?: number | null;
  emissionDirecteMoteurThermique?: number | null;
  emissionDirecteHorsEnergie?: number | null;
  emissionDirecteFugitives?: number | null;
  emissionBiomasse?: number | null;
  emissionIndirecteConsoElec?: number | null;
  emissionIndirecteConsoVapeurChaleurFroid?: number | null;
  emissionNonIncluseDansDirectOuIndirecte?: number | null;
  achatProduitOuService?: number | null;
  immobilisationBien?: number | null;
  dechet?: number | null;
  transportMarchandiseAmont?: number | null;
  deplacementProfessionnel?: number | null;
  leasingAmont?: number | null;
  investissement?: number | null;
  transportVisiteursClients?: number | null;
  transportMarchandiseAval?: number | null;
  utilisationProduitVendu?: number | null;
  finVieProduitVendu?: number | null;
  franchiseAval?: number | null;
  leasingAval?: number | null;
  deplacementDomicileTravail?: number | null;
  autreEmissionIndirecte?: number | null;
  consoEnergieFinale?: number | null;
  surfaceTotaleBatiments?: number | null;
  consoEnergieFinaleParM2?: number | null;
  consoEnergiePrimaireParM2?: number | null;
  intensiteCarboneParM2?: number | null;
  bilanCarboneTotalParM2?: number | null;
  bilanCarboneTotalParUsager?: number | null;
  effectifTotal?: number | null;
  /** Any other numeric fields returned by the API */
  [key: string]: number | null | undefined;
}

@Injectable({ providedIn: 'root' })
export class SyntheseEgesService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  getSynthese(entiteId: number, annee: number): Observable<SyntheseEgesResult> | undefined {
    const token = this.auth.getToken();
    if (!token) return undefined;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
    return this.http.get<SyntheseEgesResult>(
      ApiEndpoints.SyntheseEges.getByEntite(entiteId, annee),
      { headers }
    );
  }
}
