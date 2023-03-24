import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Person {
  username: string, email: string, password: string
}


@Injectable({ providedIn: 'root'})
export class Service {


  private readonly _http = inject(HttpClient);

  public login(person: Person): Observable<number> {

      return this._http.post<number>("/login", person);
  }

  public register(person: Person): Observable<number>{

    return this._http.post<number>("/register", person);
  }


}
