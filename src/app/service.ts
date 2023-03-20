import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Person {
  username: string, password: string
}

export interface Message {
  function: string, person: Person, content: any
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


    return boards;
  }

  getPerson(): Person | null{
    return aktualPerson;
  }


  public login(person: Person): boolean {
      console.log(person);

      const message =  {
        function: "login",
        person: person,
        content: null
      }
      //socket api abfragen zu login
      socket.send(JSON.stringify(message));

      aktualPerson = person;


    //return logged in ?
    return true;
  }

  public register(person: Person): boolean{
    console.log(person);

    const message =  {
      function: "register",
      person: person,
      content: null
    }
    //socket api abfragen zu registrieren
    socket.send(JSON.stringify(message));

    aktualPerson = person;

    //todo: return registered and logged in?
    return true;
  }


}
