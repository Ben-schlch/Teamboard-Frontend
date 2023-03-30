import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {from, map, Observable, Observer, of, Subject, switchAll } from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';
import { AnonymousSubject } from 'rxjs/internal/Subject';


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

//todo: add index to sort!!!
export interface State{
  state: string,
  subtasks: Subtask[]
}

export interface Subtask{
  name: string,
  description: string,
  worker: Person["username"]
}


const SOCKET_URL = "ws://localhost:8080/";
//const SOCKET_PORT = ":8080/";
// Create WebSocket connection.
//const socket = new WebSocket("ws://localhost:8080");
//let socket: WebSocket = new WebSocket("ws://localhost:8080/0");

//let socket: WebSocket | null = null;
let aktualPerson: Person | null = null;
let boardsString: string[]  = ["DefaultBoard"];


//Connection opened

  // @ts-ignore
//   socket.addEventListener("open", (event) => {
//     socket.send("Initial Request");
//   });
//
//
//
// // Listen for messages
// socket.addEventListener("message", (event) => {
//   console.log("Message from server ", event.data);
//
//   //JSON.parse(event.data).function
//
//   if(event.data.contains("login")){
//
//   }else if(JSON.parse(event.data).function.toLowerCase() == "add_task".toLowerCase()){
//        // Service.getTasks()
//   }
//   //todo: do something
// });

@Injectable({ providedIn: 'root'})
export class Service {



  private readonly _http = inject(HttpClient);
  private socketId: number = 0;
  //public _boardsObservable: Observable<Board[]> = this.getBoards().pipe(switchAll());

  public _boardsObservable: Observable<Board[]> = of([]);

  //public _boardsObservable: Observable<Board[]> = this.getBoards();

  private subject: any;

  addBoard(newBoard: Board) {
    let boardsArray: Board[] = [];

    if(this._boardsObservable !== undefined){
      //move Observable to array to add subtask
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }

    boardsArray.push(newBoard);

    this._boardsObservable = of(boardsArray);
  }

  //add Task to Observable
  addTask(boardGet: Board, newTask: Task) {
    let boardsArray: Board[] = [];

    if(this._boardsObservable !== undefined){
      //move Observable to array to add subtask
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }


    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if(boardsArrayElement === boardGet){
        boardsArrayElement.tasks.push(newTask)
      }
    }

    this._boardsObservable = of(boardsArray);
  }

  //add Subtask to Observable
  addSubtask(boardGet: string, taskGet: Task, stateGet: State) {

    //check wether subtask is addad bevore
    let subTask: Subtask = {
      name: 'new Subtask',
      description: 'holly shit it works',
      worker: ''
    }

    let boardsArray: Board[] = [];

    console.log("parse task");
    //move Observable to array to add subtask
    if(this._boardsObservable !== undefined){
      // @ts-ignore
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }


    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if(boardsArrayElement.name === boardGet){

        for(const tasksArrayElement of boardsArrayElement.tasks){
          if(tasksArrayElement === taskGet){

            for (const state of tasksArrayElement.states) {
              if(state === stateGet){
                state.subtasks.push(subTask);
                console.log("Push task");
              }
            }
          }
        }
      }
    }

    this._boardsObservable = of(boardsArray);

    this._boardsObservable.subscribe((v) => console.log(`value: ${v}`));
  }

  addState(boardGet: Board, taskGet: Task, newState: State) {
    let boardsArray: Board[] = [];

    console.log("parse task");
    //move Observable to array to add subtask
    if(this._boardsObservable !== undefined){
      // @ts-ignore
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }


    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if(boardsArrayElement === boardGet){

        for(const tasksArrayElement of boardsArrayElement.tasks){
          if(tasksArrayElement === taskGet){

            tasksArrayElement.states.push(newState);
          }
        }
      }
    }

    this._boardsObservable = of(boardsArray);
  }


  deleteBoard(getBoard: Board) {
    let boardsArray: Board[] = [];

    if(this._boardsObservable !== undefined){
      //move Observable to array to add subtask
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }

    const index = boardsArray.indexOf(getBoard);

    if(index !== -1){
      boardsArray.splice(index, 1);
    }
  }

  //initial request to get all boards?
  getBoards(){

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

    let state4: State = {
      state: "In Progress",
      subtasks: []
    }

    let state3: State = {
      state: "ToDo",
      subtasks: [subtask11, subtask12]
    }

    let task1: Task = {
      name: "Testtask1",
      states: [state2, state1, state4]
    }

    let task2: Task = {
      name: "Testtask2",
      states: [state3, state4]
    }

    let task3: Task = {
      name: "Testtask3",
      states: [state3]
    }

    let board1: Board = {
      name: 'Board 1',
      tasks: [task1, task2]
    }

    let board2: Board = {
      name: 'Board 2',
      tasks: []
    }


    //this._boardsObservable = this._http.get<string[]>('/api/getBoardsNames/' + socketId, aktualPerson);
    this._boardsObservable = from([[board1, board2]]);

    return this._boardsObservable;

  }

  public login(person: Person): Observable<number> {
    const socketId =   this._http.post<number>("/login", person);
    let socketIdNumber: number = 0;
    aktualPerson = person;

    socketId.subscribe( id => {
      socketIdNumber = id as number;
    });

    //socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    this.socketId = socketIdNumber;


    if(this.socketId > 0){
      this.initialiceObservable();
    }


    //this.getBoards();

    return socketId;
  }



  public register(person: Person): Observable<number>{

    //const socketId =  this._http.post<number>("/register", person);

    const socketId = of(5050);

    let socketIdNumber: number = 0;

    //move Observable to array to add subtask
    socketId.subscribe( id => {
      socketIdNumber = id as number;
    });

    this.socketId = socketIdNumber;

    if(this.socketId > 0){
      //this.initialiceObservable();
    }

    //delete
    this._boardsObservable =  this.getBoards();

    this._boardsObservable.subscribe((v) => console.log(`value: ${v}`));
    //socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    return socketId;
  }

  //
  //Observable
  //


  initialiceObservable() {

    this._boardsObservable = this.connect().pipe(
      map((response: MessageEvent): any => {
        let data = JSON.parse(response.data)

        console.log(data);
        if(data.function != null){
          switch (data.function) {
            case "addSubtask":
              console.log('addSubtask');
              // parse subtask and add to
              break;
            case 'addBoard':
              console.log('addBoard');
            // parse board and add to
              break;
            default: console.error('No case found: ', data);
          }
        }

        return data;
      })
    );
    //throw new Error('Method not implemented.');
  }

  public connect(): Observable<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create();
    }
    return this.subject;
  }

  private create(): Observable<MessageEvent> {
    let ws = new WebSocket(SOCKET_URL + this.socketId);
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    let observer = {
      error: (error: ErrorEvent) => null,
      complete: () => null,
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}

