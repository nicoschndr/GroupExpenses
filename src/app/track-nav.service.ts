import { Injectable } from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrackNavService {

  constructor(private router: Router) {}

  checkIfInGroupView(): Observable<boolean> {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      map(e => (e as NavigationStart).url.indexOf('gId') !== -1));
  }
}


