import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Person {
  userType: string, username: string, password: string, rememberMe: string
}

@Injectable({ providedIn: 'root'})
export class Service {
  public login(person: Person): void {
      console.log(person);
  }
}
