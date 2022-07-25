import { Injectable } from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrackNavService {

  constructor(private router: Router) {}

  /**
   * This function will track the url
   * It is constantly checking if there is the parameter 'gId' saved in the url
   * It returns a boolean, after which the function of the '+' icon of the navbar is rendered.
   */
  checkIfInGroupView(): Observable<boolean> {
    return this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      map(e => (e as NavigationStart).url.indexOf('gId') !== -1));
  }
}


