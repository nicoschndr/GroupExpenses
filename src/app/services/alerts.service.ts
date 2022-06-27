import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  errors: Map<string, string> = new Map<string, string>();

  constructor() { }
}
