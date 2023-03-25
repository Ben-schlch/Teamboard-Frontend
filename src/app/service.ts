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

// Create WebSocket connection.
//const socket = new WebSocket("ws://localhost:8080");
let socket: WebSocket = new WebSocket("ws://localhost:8080/0");
let aktualPerson: Person | null = null;
let boardsString: string[]  = ["DefaultBoard"];


//Connection opened

  // @ts-ignore
  socket.addEventListener("open", (event) => {
    socket.send("Initial Request");
  });



// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);

  //JSON.parse(event.data).function

  if(event.data.contains("login")){

  }else if(JSON.parse(event.data).function.toLowerCase() == "add_task".toLowerCase()){
       // Service.getTasks()
  }
  //todo: do something
});

@Injectable({ providedIn: 'root'})
export class Service {
  addTask(boardGet: Board, newTask: Task) {
    let boardsArray: Board[] = [];

    //move Observable to array to add subtask
    this._boardsObservable.subscribe( board => {
      boardsArray = board as Board[]
    });

    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if(boardsArrayElement === boardGet){
        boardsArrayElement.tasks.push(newTask)
      }
    }

    this._boardsObservable = of(boardsArray);
  }
  addSubtask(boardGet: string, taskGet: Task) {

    //check wether subtask is addad bevore
    let subTask: Subtask = {
      name: 'new Subtask',
      description: 'holly shit it works',
      worker: ''
    }

    let boardsArray: Board[] = [];

    //move Observable to array to add subtask
    this._boardsObservable.subscribe( board => {
      boardsArray = board as Board[]
    });

    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if(boardsArrayElement.name === boardGet){
        for(const tasksArrayElement of boardsArrayElement.tasks){
          if(tasksArrayElement === taskGet){
            if(tasksArrayElement.states.length > 0){
              tasksArrayElement.states[0].subtasks.push(subTask);
            }
          }
        }
      }
    }

    this._boardsObservable = of(boardsArray);

    this._boardsObservable.subscribe((v) => console.log(`value: ${v}`));
  }

  private readonly _http = inject(HttpClient);
  private socketId: number = 0;

  protected _boardsObservable: Observable<Board[]> = of([]);

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


    socketId.subscribe( id => {
      socketIdNumber = id as number;
    });

    socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    this.socketId = socketIdNumber;

    initialiceObservable();

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

    socket = new WebSocket("ws://localhost:8080/" + socketIdNumber);

    return socketId;
  }

}

function initialiceObservable(): Observable<Board> {
  //take incomming observable and take it on observable

    throw new Error('Function not implemented.');
}

