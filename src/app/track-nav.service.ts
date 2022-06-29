import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TrackNavService {

  constructor(
  ) {
  }

  trackRouteChanges(gId: string): boolean {
      if (gId !== null){
        return false;
      }
      return true;
  }
}


