import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Person {
  username: string, email: string, password: string
}


// Create WebSocket connection.
const socket = new WebSocket("wss://localhost:8080");
let aktualPerson: Person | null = null;


// Connection opened
socket.addEventListener("open", (event) => {
  socket.send("Initial Request");
});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
  //todo: do something
});

@Injectable({ providedIn: 'root'})
export class Service {
  getBoards(): Observable<string[]> {

    let boards:Observable<string[]> = of(["testboard1", "testboard2", "testboard3"]);
    //todo: socket anfragen nach boards von person

  private readonly _http = inject(HttpClient);

  public login(person: Person): Observable<number> {
    return boards;
  }

      return this._http.post<number>("/login", person);
  }

  public register(person: Person): Observable<number>{

    return this._http.post<number>("/register", person);
  }


}
