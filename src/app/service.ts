import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Person {
  username: string, password: string
}

export interface Message {
  function: string, content: any
}

// Create WebSocket connection.
const socket = new WebSocket("wss://localhost:8080");


// Connection opened
socket.addEventListener("open", (event) => {
  socket.send("Hello Server!");
});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});

@Injectable({ providedIn: 'root'})
export class Service {

  //declare socket


  //hier ist die ganze Kommunikation zum Backend

  //on init  open socket

  public login(person: Person): boolean {
      console.log(person);

      const message =  {
        function: "login",
        content: person
      }
      //socket api abfragen zu login
      socket.send(JSON.stringify(message));

    //return logged in ?
    return true;
  }

  public register(person: Person): boolean{
    console.log(person);

    //socket api abfragen zum registrieren

    //return registered and logged in?
    return true;
  }


  //let socket = new WebSocket("wss://localhost:8080");


}
