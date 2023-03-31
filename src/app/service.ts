import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {from, map, Observable, Observer, of, Subject, switchAll } from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import {webSocket} from "rxjs/webSocket";

// interface for logged in Person
export interface Person {
  name: string, email: string, pwd: string
}

//interfaces for Datastruckture
export interface Board{
  id: number,
  name: string,
  tasks: Task[]
}
export interface Task{
  id: number,
  //position: number,
  name: string,
  states: State[]
}
export interface State{
  id: number,

  position: number,
  state: string,
  subtasks: Subtask[]
}
export interface Subtask{
  id: number,
  position: number,
  name: string,
  description: string,
  worker: Person["name"]
}

//add interfaces for communication
export interface MessageAddBoard{
  kind_of_object: string,
  type_of_edit: string,
  teamboard: Board,
}
export interface MessageAddTask{
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: Task
}
export interface MessageAddState{
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: State
}
export interface MessageAddSubtask{
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: number,
  subtask: Subtask
}

//delete interfaces for communication
export interface MessageDeleteBoard{
  kind_of_object: string,
  type_of_edit: string,
  teamboard: Board,
}
export interface MessageDeleteTask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: Task
}
export interface MessageDeleteState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: State
}
export interface MessageDeleteSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: number,
  subtask: Subtask
}

//move interfaces for communication
export interface MessageMoveState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  oldPosition: number,
  newPosition: number,
  column: State
}
export interface MessageMoveSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: number,
  oldPosition: number,
  newPosition: number,
  subtask: Subtask
}


//socketComponents
const SOCKET_URL = "ws://localhost:8000/";
let socket = webSocket('0.0.0.0');

let aktualPerson: Person | null = null;
let boardsString: string[]  = ["DefaultBoard"];

// get message from server
socket.subscribe(
  msg => console.log(msg),
  error => console.log(error),
  () => console.log('completed')
);

//send message to server
socket.next({message: 'thats an testmessage.'});

//close connection
socket.complete();

//close connection after sending server error message
socket.error({code: 4000, reason: 'Some error, close connection'});

@Injectable({ providedIn: 'root'})
export class Service {

  private readonly _http = inject(HttpClient);
  private socketAuthentification: string = '';
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

    let message: MessageAddBoard = {
      kind_of_object: 'board',
      type_of_edit: 'add',
      teamboard: newBoard
    }
    socket.next(JSON.stringify(message))

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

    let message: MessageAddTask = {
      kind_of_object: 'task',
      type_of_edit: 'add',
      teamboard: boardGet.id,
      task: newTask
    }
    socket.next(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }

  //add Subtask to Observable
  addSubtask(boardGet: Board, taskGet: Task, stateGet: State, subtask: Subtask) {

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
      if(boardsArrayElement.name === boardGet.name){

        for(const tasksArrayElement of boardsArrayElement.tasks){
          if(tasksArrayElement === taskGet){

            for (const state of tasksArrayElement.states) {
              if(state === stateGet){
                state.subtasks.push(subtask);
                console.log("Push task");
              }
            }
          }
        }
      }
    }
    //sending message on socket
    const messageAddSubtask: MessageAddSubtask = {
      kind_of_object: 'subtask',
      type_of_edit: 'add',
      teamboard: boardGet.id,
      task: taskGet.id,
      column: stateGet.id,
      subtask: subtask
    }
    console.log("Send to Server: ", JSON.stringify(messageAddSubtask));
    socket.next(JSON.stringify(messageAddSubtask));

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


    let message: MessageAddState = {
      kind_of_object: 'board',
      type_of_edit: 'add',
      teamboard: boardGet.id,
      task: taskGet.id,
      column: newState
    }
    socket.next(JSON.stringify(message))

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

    const message: MessageDeleteBoard = {
      kind_of_object: 'board',
      type_of_edit: 'delete',
      teamboard: getBoard
    }
    socket.next(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }

  deleteState(boardGet: Board, taskGet: Task, stateGet: State) {
    let boardsArray: Board[] = [];

    if(this._boardsObservable !== undefined){
      //move Observable to array to add subtask
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }

    const boardIndex = boardsArray.indexOf(boardGet);

    let taskIndex = -1;
    if(boardIndex !== -1){
      taskIndex = boardsArray.at(boardIndex).tasks.indexOf(taskGet);
    }

    let stateIndex = -1;
    if (taskIndex !== -1){
      stateIndex = boardsArray.at(boardIndex).tasks.at(taskIndex).states.indexOf(stateGet);
      boardsArray.at(boardIndex).tasks.at(taskIndex).states.splice(stateIndex, 1);
    }
    
    const message: MessageDeleteState = {
      kind_of_object: 'column',
      type_of_edit: 'delet',
      teamboard: boardGet.id,
      task: taskGet.id,
      column: stateGet
    }
    socket.next(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }


  //initial request to get all boards?
  getBoards(){

    let subtask1: Subtask = {
      name: "Subtask1",
      description: "test description1",
      worker: "Testworker1",
      id: 0,
      position: 0
    }
    let subtask2: Subtask = {
      name: "Subtask2",
      description: "test description2",
      worker: "Testworker2",
      id: 0,
      position: 0
    }

    let subtask11: Subtask = {
      name: "Subtask1",
      description: "test description1",
      worker: "Testworker1",
      id: 0,
      position: 0
    }
    let subtask12: Subtask = {
      name: "Subtask2",
      description: "test description2",
      worker: "Testworker2",
      id: 0,
      position: 0
    }


    let subtask3: Subtask = {
      name: "Subtask3",
      description: "test description",
      worker: "Testworker2",
      id: 0,
      position: 0
    }

    let state1: State = {
      state: "Done",
      subtasks: [subtask3],
      id: 0,
      position: 0
    }
    let state2: State = {
      state: "ToDo",
      subtasks: [subtask1, subtask2],
      id: 0,
      position: 0
    }

    let state4: State = {
      state: "In Progress",
      subtasks: [],
      id: 0,
      position: 0
    }

    let state3: State = {
      state: "ToDo",
      subtasks: [subtask11, subtask12],
      id: 0,
      position: 0
    }

    let task1: Task = {
      name: "Testtask1",
      states: [state2, state1, state4],
      id: 0
    }

    let task2: Task = {
      name: "Testtask2",
      states: [state3, state4],
      id: 0
    }

    let task3: Task = {
      name: "Testtask3",
      states: [state3],
      id: 0
    }

    let board1: Board = {
      name: 'Board 1',
      tasks: [task1, task2],
      id: 0
    }

    let board2: Board = {
      name: 'Board 2',
      tasks: [],
      id: 0
    }


    //this._boardsObservable = this._http.get<string[]>('/api/getBoardsNames/' + socketId, aktualPerson);
    this._boardsObservable = from([[board1, board2]]);

    return this._boardsObservable;

  }

  public login(person: Person): Observable<string> {
    const socketAuthentificationObservable =   this._http.post<string>("/login", person);
    let socketAuth: string = '';
    aktualPerson = person;

    socketAuthentificationObservable.subscribe( id => {
      socketAuth = id as string;
    });

    //socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    this.socketAuthentification = socketAuth;

    //open websocket
    socket = webSocket(SOCKET_URL + this.socketAuthentification);


    if(this.socketAuthentification !== ''){
      this.initialiceObservable();
    }


    //this.getBoards();

    return socketAuthentificationObservable;
  }



  public register(person: Person): Observable<string>{

    //const socketAuth =  this._http.post<string>("/register", person);

    const socketAuth = of('hylkfjahfkjhsfhslzdhxcnvvn');

    let socketAuthentification: string = '';

    //move Observable to array to add subtask
    socketAuth.subscribe( id => {
      socketAuthentification = id as string;
    });

    this.socketAuthentification = socketAuthentification;

    if(this.socketAuthentification !== ''){
      //this.initialiceObservable();
    }

    //delete
    this._boardsObservable =  this.getBoards();

  //delete
    let boardsArray: Board[] = [];
//delete
    if(this._boardsObservable !== undefined){
      //move Observable to array to add subtask
      this._boardsObservable.subscribe( board => {
        boardsArray = board as Board[]
      });
    }
  //delete
    console.log(JSON.stringify(boardsArray));


    this._boardsObservable.subscribe((v) => console.log(`value: ${v}`));
    //socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    return socketAuth;
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
    let ws = new WebSocket(SOCKET_URL + this.socketAuthentification);
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

