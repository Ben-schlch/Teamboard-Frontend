import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Person {
  username: string, password: string
}

export interface Message {
  function: string, person: Person, content: any
}

export interface Task{
  name: string,
  states: State[]
}

export interface State{
  state: string,
  subtasks: Subtask[]
}

export interface Subtask{
  name: string,
  description: string,
  worker: Person["username"]
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
  getTasks(): Observable<Task[]> {
      let subtask1: Subtask = {
        name: "Subtask1",
        description: "test description1",
        worker: "Testworker1"
      }
    let subtask2: Subtask = {
      name: "Subtask2",
      description: "test description2",
      worker: "Testworker2"
    }

    let subtask11: Subtask = {
      name: "Subtask1",
      description: "test description1",
      worker: "Testworker1"
    }
    let subtask12: Subtask = {
      name: "Subtask2",
      description: "test description2",
      worker: "Testworker2"
    }

    let subtask3: Subtask = {
      name: "Subtask3",
      description: "test description",
      worker: "Testworker2"
    }

    let state1: State = {
        state: "Done",
      subtasks: [subtask3]
    }
    let state2: State = {
      state: "ToDo",
      subtasks: [subtask1, subtask2]
    }

    let state3: State = {
      state: "ToDo",
      subtasks: [subtask11, subtask12]
    }

    let task1: Task = {
        name: "Testtask1",
      states: [state2, state1]
    }

    let task2: Task = {
      name: "Testtask2",
      states: [state3]
    }

    let tasksObservable: Observable<Task[]> = of([task1, task2]);

    return tasksObservable;
  }
  getBoards(): Observable<string[]> {

    let boards:Observable<string[]> = of(["Testboard1", "Testboard2", "Testboard3"]);
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
