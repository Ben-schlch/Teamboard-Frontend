import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {from, map, Observable, of, Subject } from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';


export interface Person {
  username: string, email: string, password: string
}


export interface Board{
  name: string,
  tasks: Task[]
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
//const socket = new WebSocket("ws://localhost:8080");
let aktualPerson: Person | null = null;
let boardsString: string[]  = ["DefaultBoard"];


// Connection opened
// socket.addEventListener("open", (event) => {
//   socket.send("Initial Request");
//
//
// });
//
// // Listen for messages
// socket.addEventListener("message", (event) => {
//   console.log("Message from server ", event.data);
//
//   if(event.data.contains("login")){
//
//   }else if(event.data.contains("tasks")){
//        // Service.getTasks()
//   }
//   //todo: do something
// });

@Injectable({ providedIn: 'root'})
export class Service {

  private readonly _http = inject(HttpClient);

  getTasks(boardName: string): Observable<Task[]> {
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



    let tasksObservable: Observable<Task[]> = from([[task1, task2]]);

      //const tasksObservable = new Subject<Task[]>();

      //tasksObservable.next([task1, task2]);

    //this._service_tasks$ = tasksObservable;


    //get Boards to iterate over them
    this.getBoards();

    return tasksObservable;

    // @ts-ignore
    //return this._http.post<Task[]>('/api/getBoard/' + boardName, aktualPerson);
  }

  // getStringBoards(): string[]{
  //   let result: string[];
  //   this.getBoards().subscribe(boards => result = boards);
  //
  //   // @ts-ignore
  //   return result;
  // }


  getBoards(): Observable<Board[]> {


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

  private readonly _http = inject(HttpClient);
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

    let board1: Board = {
      name: 'Board 1',
      tasks: [task1, task2]
    }

    let board2 : Board= {
      name: 'Board 2',
      tasks: [task1, task2]
    }



    let boardObservable: Observable<Board[]> = from([[board1, board2]]);

    return boardObservable;
    //return this._http.post<string[]>('/api/getBoardsNames/', aktualPerson);

  public login(person: Person): Observable<number> {
    return boards;
  }

      return this._http.post<number>("/login", person);
  }

  public register(person: Person): Observable<number>{

    return this._http.post<number>("/register", person);
  }


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

