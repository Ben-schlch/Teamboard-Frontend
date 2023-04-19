import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {filter, from, map, Observable, Observer, of, Subject, switchAll} from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {webSocket} from "rxjs/webSocket";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import {MessageAddBoard, MessageAddTask, MessageAddSubtask, MessageAddState, MessageDeleteBoard, MessageDeleteState, MessageDeleteSubtask, MessageDeleteTask, MessageMoveState, MessageMoveSubtask, MessageLoadBoards, MessageToken} from './models/communication';
import {Board, Person, State, Subtask, Task } from './models/boards';


//socketComponents
// für PROD: "ws://195.201.94.44:8000"

//const SOCKET_URL = "ws://localhost:8000";
const SOCKET_URL = "wss://teamboard.server-welt.com:8000/ws/";

//https://www.piesocket.com/blog/python-websocket

let socket: WebSocket | undefined = undefined;



let aktualPerson: Person | null = null;
let boardsString: string[] = ["DefaultBoard"];



@Injectable({providedIn: 'root'})
export class Service {
  loadBoards() {
      //throw new Error('Method not implemented.');

    //boardload
    const message: MessageLoadBoards = {
      kind_of_object: 'board',
      type_of_edit: 'load'
    }

    console.log("Sending Get boards...");

    sendMessageToServer(JSON.stringify(message));
  }

  private readonly _http = inject(HttpClient);

  //private _http = HttpClient;

  // constructor(private _http: HttpClient) {
  // }


  //https://195.201.94.44:8000/login
  //baseURL: string = "https://195.201.94.44:8000";
  //baseURL: string = "https://teamboard.server-welt.com:8000";
  //baseURL: string = "api";

  private socketAuthentification: string = '';

  public _boardsObservable: Observable<Board[]> = of([]);

  private subject: any;

  addBoard(newBoard: Board) {
    let boardsArray: Board[] = [];

    if (this._boardsObservable !== undefined) {
      //move Observable to array to add subtask
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }

    let message: MessageAddBoard = {
      kind_of_object: 'board',
      type_of_edit: 'add',
      teamboard: newBoard
    }

    sendMessageToServer(JSON.stringify(message));

    //socket.addEventListener('message', function (event) {
    //socket.next(JSON.stringify(message));
    //});

    boardsArray.push(newBoard);

    this._boardsObservable = of(boardsArray);
  }

  //add Task to Observable
  addTask(boardGet: Board, newTask: Task) {
    let boardsArray: Board[] = [];

    if (this._boardsObservable !== undefined) {
      //move Observable to array to add subtask
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }


    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if (boardsArrayElement === boardGet) {
        boardsArrayElement.tasks.push(newTask)
      }
    }

    let message: MessageAddTask = {
      kind_of_object: 'task',
      type_of_edit: 'add',
      teamboard_id: boardGet.id,
      task: newTask
    }

    sendMessageToServer(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }

  //add Subtask to Observable
  addSubtask(boardGet: Board, taskGet: Task, stateGet: State, subtask: Subtask) {

    let boardsArray: Board[] = [];

    subtask.worker = aktualPerson!.email;

    console.log("parse task");
    //move Observable to array to add subtask
    if (this._boardsObservable !== undefined) {
      // @ts-ignore
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }


    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if (boardsArrayElement.name === boardGet.name) {

        for (const tasksArrayElement of boardsArrayElement.tasks) {
          if (tasksArrayElement === taskGet) {

            for (const state of tasksArrayElement.states) {
              if (state === stateGet) {
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
      teamboard_id: boardGet.id,
      task_id: taskGet.id,
      state_id: stateGet.id,
      subtask: subtask
    }

    sendMessageToServer(JSON.stringify(messageAddSubtask));

    this._boardsObservable = of(boardsArray);

    this._boardsObservable.subscribe((v) => console.log(`value: ${v}`));
  }

  addState(boardGet: Board, taskGet: Task, newState: State) {
    let boardsArray: Board[] = [];

    console.log("parse task");
    //move Observable to array to add subtask
    if (this._boardsObservable !== undefined) {
      // @ts-ignore
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }

    //add subtask
    for (const boardsArrayElement of boardsArray) {
      if (boardsArrayElement === boardGet) {

        for (const tasksArrayElement of boardsArrayElement.tasks) {
          if (tasksArrayElement === taskGet) {

            tasksArrayElement.states.push(newState);
          }
        }
      }
    }


    let message: MessageAddState = {
      kind_of_object: 'state',
      type_of_edit: 'add',
      teamboard_id: boardGet.id,
      task_id: taskGet.id,
      state: newState
    }

    sendMessageToServer(JSON.stringify(message));
    //socket.send(JSON.stringify(message))

    this._boardsObservable = of(boardsArray);
  }


  deleteBoard(getBoard: Board) {
    let boardsArray: Board[] = [];

    if (this._boardsObservable !== undefined) {
      //move Observable to array to add subtask
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }

    const index = boardsArray.indexOf(getBoard);

    if (index !== -1) {
      boardsArray.splice(index, 1);
    }

    const message: MessageDeleteBoard = {
      kind_of_object: 'board',
      type_of_edit: 'delete',
      teamboard: getBoard
    }

    sendMessageToServer(JSON.stringify(message));
    //socket.send(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }

  deleteState(boardGet: Board, taskGet: Task, stateGet: State) {
    let boardsArray: Board[] = [];

    if (this._boardsObservable !== undefined) {
      //move Observable to array to add subtask
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }

    const boardIndex = boardsArray.indexOf(boardGet);

    let taskIndex = -1;
    if (boardIndex !== -1) {
      taskIndex = boardsArray.at(boardIndex).tasks.indexOf(taskGet);
    }

    let stateIndex = -1;
    if (taskIndex !== -1) {
      stateIndex = boardsArray.at(boardIndex).tasks.at(taskIndex).states.indexOf(stateGet);
      boardsArray.at(boardIndex).tasks.at(taskIndex).states.splice(stateIndex, 1);
    }

    const message: MessageDeleteState = {
      kind_of_object: 'state',
      type_of_edit: 'delete',
      teamboard_id: boardGet.id,
      task_id: taskGet.id,
      state: stateGet
    }

    sendMessageToServer(JSON.stringify(message));
    //socket.send(JSON.stringify(message));

    this._boardsObservable = of(boardsArray);
  }


  dropState(event: CdkDragDrop<State[], State[], any>, boardGet: Board, taskGet: Task) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    //position aktualisieren
    event.container.data.at(event.currentIndex).position = event.currentIndex;

    const message: MessageMoveState = {
      kind_of_object: 'state',
      type_of_edit: 'move',
      teamboard_id: boardGet.id,
      task_id: taskGet.id,
      oldPosition: event.previousIndex,
      newPosition: event.currentIndex,
      state: event.container.data.at(event.currentIndex)
    }

    sendMessageToServer(JSON.stringify(message));
  }

  moveSubtask(event: CdkDragDrop<Subtask[], Subtask[], any>, boardGet: Board, taskGet: Task, stateGet: State) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const message: MessageMoveSubtask = {
        kind_of_object: 'state',
        type_of_edit: 'moveSubtaskInState',
        teamboard_id: boardGet.id,
        task_id: taskGet.id,
        state_id: stateGet.id,
        oldPosition: event.previousIndex,
        newPosition: event.currentIndex,
        subtask: event.container.data.at(event.currentIndex)
      }
      sendMessageToServer(JSON.stringify(message));
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      const message: MessageMoveSubtask = {
        kind_of_object: 'state',
        type_of_edit: 'moveSubtaskBetweenStates',
        teamboard_id: boardGet.id,
        task_id: taskGet.id,
        state_id: stateGet.id,
        oldPosition: event.previousIndex,
        newPosition: event.currentIndex,
        subtask: event.container.data.at(event.currentIndex)
      }
      sendMessageToServer(JSON.stringify(message));
    }

  }

  //initial request to get all boards?
  getBoards() {

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
      id: 1,
      position: 1
    }

    let subtask11: Subtask = {
      name: "Subtask1",
      description: "test description1",
      worker: "Testworker1",
      id: 3,
      position: 0
    }
    let subtask12: Subtask = {
      name: "Subtask2",
      description: "test description2",
      worker: "Testworker2",
      id: 4,
      position: 1
    }


    let subtask3: Subtask = {
      name: "Subtask3",
      description: "test description",
      worker: "Testworker2",
      id: 5,
      position: 0
    }

    let state1: State = {
      state: "Done",
      subtasks: [subtask3],
      id: 6,
      position: 0
    }
    let state2: State = {
      state: "ToDo",
      subtasks: [subtask1, subtask2],
      id: 7,
      position: 0
    }

    let state4: State = {
      state: "In Progress",
      subtasks: [],
      id: 8,
      position: 0
    }

    let state3: State = {
      state: "ToDo",
      subtasks: [subtask11, subtask12],
      id: 9,
      position: 0
    }

    let task1: Task = {
      name: "Testtask1",
      states: [state2, state1, state4],
      id: 10
    }

    let task2: Task = {
      name: "Testtask2",
      states: [state3, state4],
      id: 11
    }

    let task3: Task = {
      name: "Testtask3",
      states: [state3],
      id: 12
    }

    let board1: Board = {
      name: 'Board 1',
      tasks: [task1, task2],
      id: 13
    }

    let board2: Board = {
      name: 'Board 2',
      tasks: [],
      id: 14
    }


    //this._boardsObservable = this._http.get<string[]>('/api/getBoardsNames/' + socketId, aktualPerson);
    this._boardsObservable = from([[board1, board2]]);

    return this._boardsObservable;

  }

  public login(person: Person): Observable<string> {
    let socketAuth: string = '';

    //delete if statement
    //if((person.email !== 'CodeMonkey')){
      const headers = { 'content-type': 'application/json'};
      const body=JSON.stringify(person);

      console.log('Not debug!', person.email, person.pwd);
      console.log("Sending data to server: ", body);
      let socketAuthentificationObservable = this._http.post<MessageToken>('/api/login', person).subscribe({
        next: (token) => {
          socketAuth = token.token;
          console.log("SocketAuth: ", socketAuth);

          this.socketAuthentification = token.token;

          this._boardsObservable.subscribe( board => console.log(board));

          getWebSocket(socketAuth, this._boardsObservable);

        }, error: (error) => {
          this.socketAuthentification = '';
        }
    });

    aktualPerson = person;
    console.log("Socketauth: ", this.socketAuthentification);
    console.log(' debug! initialiced socket');

    return of(this.socketAuthentification);
  }


  public register(person: Person): Observable<boolean> {

    let isRegistered = false;
    let registerObservable = this._http.post<boolean>('/api/register/', person).subscribe({
      next: (getIsRegistered) => {
        isRegistered = getIsRegistered;
      },
      error: (error) => {
        console.log("ERROR!!");
        isRegistered = false;
      }
      }
    );
    return of(isRegistered);
  }

  //
  //Observable
  //Communication
  //

  initialiceObservable() {

    this._boardsObservable = this.connect().pipe(
      map((response: MessageEvent): any => {
        let data = JSON.parse(response.data)

        console.log(data);
        if (data.function != null) {
          switch (data.function) {
            case "addSubtask":
              console.log('addSubtask');
              // parse subtask and add to
              break;
            case 'addBoard':
              console.log('addBoard');
              // parse board and add to
              break;
            default:
              console.error('No case found: ', data);
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

function getWebSocket(socketAuthentification: string, _boardsObservable: Observable<Board[]>) {
  const webSocket = new WebSocket(SOCKET_URL + socketAuthentification);

  const message: MessageLoadBoards = {
    kind_of_object: 'board',
    type_of_edit: 'load'
  }

  console.log("Sending Get boards...", JSON.stringify(message));

  webSocket.addEventListener("open", (event: any) => {
    // @ts-ignore
    webSocket.send(JSON.stringify(message));
  });

  // @ts-ignore
  webSocket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    try {
      parseData(JSON.parse(event.data.toString()), _boardsObservable);
    } catch (error) {
      console.log(error);
    }

  });

  // @ts-ignore
  webSocket.addEventListener("error", event => {
    console.log("error from server: ", event.type);
  });

  // @ts-ignore
  webSocket.onmessage = (event) => {
    console.log(event.data);
  };

  socket = webSocket;
}

function sendMessageToServer(message: string) {
  console.log("Sending data to server: ", JSON.stringify(message));
  if (socket !== undefined) {
    socket.send(message);
  }

}

function parseData(JSONObject: any, _boardsObservabel: Observable<Board[]>) {
//incomming numbers (ID, Position) can be <0 -> ERROR!!!

  console.log(JSON.stringify(JSONObject));

  switch (JSONObject.kind_of_object) {
    case 'board':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addBoard(JSONObject.teamboard, _boardsObservabel);
          break;
        case 'delete':
          deleteBoard(JSONObject.teamboard, _boardsObservabel);
          break;
      }
      break;


    case 'task':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addTask(JSONObject.teamboard_id, JSONObject.task, _boardsObservabel);
          break;
        case 'delete':
          deleteTask(JSONObject.teamboard_id, JSONObject.task, _boardsObservabel);
          break;
      }
      break;


    case 'state':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state, _boardsObservabel);
          break;
        case 'delete':
          deleteState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state, _boardsObservabel);
          break;
        case 'move':
          moveState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state, _boardsObservabel);
          break;
      }
      break;

    case 'subtask':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addSubtask(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state_id, JSONObject.subtask, _boardsObservabel);
          break;
        case 'delete':
          deleteSubtask(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state_id, JSONObject.subtask, _boardsObservabel);
          break;

        // case 'move':
        //   moveSubtask(JSONObject.teamboard, JSONObject.task, JSONObject.column, JSONObject.subtask, _boardsObservabel);
        //   break;
        // case 'moveSubtaskInState':
        //   //moveSubtaskInState(JSONObject.teamboard, JSONObject.task, JSONObject.column, JSONObject.subtask, _boardsObservabel);
        //   break;
      }
      break;
  }
}


// allways sort boardsarray!!!

function addBoard(addBoard: any, _boardsObservable: Observable<Board[]>): void {
  //let addBoard = JSON.parse(boardInput);

  let newBoard: Board = {
    id: addBoard.id,
    name: addBoard.name,
    tasks: addBoard.tasks
  }


  let boardsArray: Board[] = [];

  if (_boardsObservable !== undefined) {
    //move Observable to array to add subtask
    _boardsObservable.subscribe((board: Board[]) => {
      boardsArray = board as Board[]
    });
  }

  const index = boardsArray.findIndex((board) => board.name === newBoard.name);

  //wenn board noch nicht vorhanden hinzufügen, sonst nur index hinzufügen
  if (index === -1) {
    boardsArray.push(newBoard);
  } else {
    boardsArray[index].id = newBoard.id;
  }

  //observable aktualisieren
  _boardsObservable = of(boardsArray);
}

function deleteBoard(deleteBoard: any, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = [];

  let newBoard: Board = {
    id: deleteBoard.id,
    name: deleteBoard.name,
    tasks: deleteBoard.tasks
  }

  if (_boardsObservable !== undefined) {
    //move Observable to array to add subtask
    _boardsObservable.subscribe(board => {
      boardsArray = board as Board[]
    });
  }

  const index = boardsArray.findIndex((board) => board.name === newBoard.name);

  //wenn nicht gefunden nichts machen
  if (index !== -1) {
    boardsArray.splice(index, 1);
  }

  _boardsObservable = of(boardsArray);
}


function addTask(teamboard: number, newTask: Task, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === teamboard);

  const taskIndex: number = boardsArray[boardIndex].tasks.findIndex((task) => task.name === newTask.name);

  if(taskIndex === -1){
    boardsArray[boardIndex].tasks.push(newTask);
  }else{
    boardsArray[boardIndex].tasks[taskIndex].id = newTask.id;
  }

  _boardsObservable = of(boardsArray);
}

function deleteTask(teamboard: number, taskGet: Task, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = [];

  if (_boardsObservable !== undefined) {
    //move Observable to array to add subtask
    _boardsObservable.subscribe(board => {
      boardsArray = board as Board[]
    });
  }

  const boardIndex = boardsArray.findIndex(board => board.id === teamboard);

  const taskIndex: number = boardsArray[boardIndex].tasks.findIndex((task) => task.name === taskGet.name);

  if(taskIndex !== -1){
    boardsArray[boardIndex].tasks.splice(taskIndex, 1);
  }

  _boardsObservable = of(boardsArray);
}


function addState(boardId: number, taskId: number, column: State, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === boardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);

  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.state === column.state);

  if(stateIndex === -1){
    boardsArray[boardIndex].tasks[taskIndex].states.push(column);
  }else {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].id = column.id;
  }

  _boardsObservable = of(boardsArray);
}

function deleteState(boardId: number, taskId: number, stateGet: State, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === boardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);

  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.id === stateGet.id);

  if(stateIndex !== -1){
    console.log("Delete Board");
    boardsArray[boardIndex].tasks[taskIndex].states.splice(stateIndex, 1);
  }
  console.log("initalice observable new..");
  _boardsObservable = of(boardsArray);
}


//how to sort them???
function moveState(teamboard: number, task: number, column: State, _boardsObservable: Observable<Board[]>) {
  throw new Error('Function not implemented.');
  // let boardsArray: Board[] = getBoardsArray(_boardsObservable);
  //
  // const stateIndex = boardsArray[teamboard].tasks[task].states.findIndex(state => state === column);
  //
  // boardsArray[teamboard].tasks[task].states[stateIndex].position = column.position;
  //
  // //todo: sort the array!!!??? -> get all States with new positions?
  // boardsArray[teamboard].tasks[task].states.sort((state1, state2) => state1.position - state2.position);
  // for (const state of boardsArray[teamboard].tasks[task].states) {
  //   state.subtasks.sort((subtask1, subtask2) => subtask1.position - subtask2.position);
  // }
  //
  // _boardsObservable = of(boardsArray);
}


function addSubtask(teamboardId: number, taskId: number, columnId: number, subtask: Subtask, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === teamboardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);
  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.id === columnId);


  const subtaskIndex = boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.findIndex(subtasks => subtasks.name === subtask.name);

  if(subtaskIndex === -1){
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.push(subtask);
  }else {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks[subtaskIndex].id = subtask.id;
  }

  _boardsObservable = of(boardsArray);
}

function deleteSubtask(teamboardId: number, taskId: number, columnId: number, subtaskGet: Subtask, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === teamboardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);
  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.id === columnId);

  const subtaskIndex = boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.findIndex(subtask => subtask === subtaskGet);

  if(subtaskIndex !== -1){
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.splice(subtaskIndex, 1);
  }

  _boardsObservable = of(boardsArray);
}

//{"kind_of_object":"state","type_of_edit":"moveSubtaskInState","teamboard":0,"task":0,"column":0,"oldPosition":1,"newPosition":0,"subtask":{"name":"Subtask2","description":"test description2","worker":"Testworker2","id":0,"position":0}}
//{"kind_of_object":"state","type_of_edit":"moveSubtaskBetweenStates","teamboard":0,"task":0,"column":0,"oldPosition":0,"newPosition":0,"subtask":{"name":"Subtask2","description":"test description2","worker":"Testworker2","id":0,"position":0}}
function moveSubtask(teamboard: any, task: any, column: any, subtask: any, _boardsObservabel: Observable<Board[]>) {
  throw new Error('Function not implemented.');
}

function getBoardsArray(_boardsObservable: Observable<Board[]>): Board[] {
  let boardsArray: Board[] = [];

  if (_boardsObservable !== undefined) {
    //move Observable to array to add subtask
    _boardsObservable.subscribe(board => {
      boardsArray = board as Board[]
    });
  }

  return boardsArray;
}



