import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {filter, from, map, Observable, Observer, of, Subject, switchAll} from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {webSocket} from "rxjs/webSocket";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

// interface for logged in Person
export interface Person {
  name: string,
  email: string,
  pwd: string
}

//interfaces for Datastruckture
export interface Board {
  id: number,
  name: string,
  tasks: Task[]
}

export interface Task {
  id: number,
  //position: number,
  name: string,
  states: State[]
}

export interface State {
  id: number,

  position: number,
  state: string,
  subtasks: Subtask[]
}

export interface Subtask {
  id: number,
  position: number,
  name: string,
  description: string,
  worker: Person["name"]
}

//add interfaces for communication
export interface MessageAddBoard {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: Board,
}

export interface MessageAddTask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard_id: number,
  task: Task
}

export interface MessageAddState {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: State
}

export interface MessageAddSubtask {
  kind_of_object: string,
  type_of_edit: string,
  teamboard: number,
  task: number,
  column: number,
  subtask: Subtask
}

//delete interfaces for communication
export interface MessageDeleteBoard {
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
const SOCKET_URL = "ws://localhost:8000";

//https://www.piesocket.com/blog/python-websocket

let socket: WebSocket | undefined = undefined;



let aktualPerson: Person | null = null;
let boardsString: string[] = ["DefaultBoard"];



@Injectable({providedIn: 'root'})
export class Service {

  private readonly _http = inject(HttpClient);
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
      teamboard: boardGet.id,
      task: taskGet.id,
      column: stateGet.id,
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
      teamboard: boardGet.id,
      task: taskGet.id,
      column: newState
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
      kind_of_object: 'column',
      type_of_edit: 'delet',
      teamboard: boardGet.id,
      task: taskGet.id,
      column: stateGet
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
      teamboard: boardGet.id,
      task: taskGet.id,
      oldPosition: event.previousIndex,
      newPosition: event.currentIndex,
      column: event.container.data.at(event.currentIndex)
    }

    sendMessageToServer(JSON.stringify(message));
  }

  moveSubtask(event: CdkDragDrop<Subtask[], Subtask[], any>, boardGet: Board, taskGet: Task, stateGet: State) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      const message: MessageMoveSubtask = {
        kind_of_object: 'state',
        type_of_edit: 'moveSubtaskInState',
        teamboard: boardGet.id,
        task: taskGet.id,
        column: stateGet.id,
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
        teamboard: boardGet.id,
        task: taskGet.id,
        column: stateGet.id,
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
    let socketAuthentificationObservable = of('-1');

    //delete if statement
    if((person.email !== 'CodeMonkey')){
      console.log('Not debug!', person.email, person.pwd);
      socketAuthentificationObservable = this._http.post<string>("/login", person);
    }else{
      console.log(' debug!', person.email, person.pwd);
    }
    let socketAuth: string = '';
    aktualPerson = person;

    socketAuthentificationObservable.subscribe(id => {
      socketAuth = id as string;
    });

    //DELETE!!!
    if(person.email === 'CodeMonkey'){
      socketAuth = 'testAuth';
      console.log(' debug!', socketAuth);
    }

    if(socketAuth === ''){
      console.log('Early return..')
      return socketAuthentificationObservable;
    }

    //hier wift er einen fehler
    //this.socketAuthentification = socketAuth;


    console.log(' debug! initialiced socket');

    //DELETE Firstpart!!!
    if(person.email === 'CodeMonkey'){
      this._boardsObservable = this.getBoards();

      console.log('initialice observable', getBoardsArray(this._boardsObservable));
    }else{
      //dont delete!!
      this._boardsObservable = this._http.get<Board[]>('/getBoards/' + socketAuth);
    }

    console.log(' debug! socket: ', socketAuth);

    //open websocket -> throws error?!!
    //getWebSocket(socketAuth, this._boardsObservable);

    console.log("return", socketAuthentificationObservable)
    return socketAuthentificationObservable;
  }


  public register(person: Person): Observable<boolean> {

    const isRegistered =  this._http.post<boolean>('/register', person);
    return isRegistered;
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


  webSocket.addEventListener("open", (event: any) => {
    // @ts-ignore
    webSocket.send("Hello");
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
          addTask(JSONObject.teamboard, JSONObject.task, _boardsObservabel);
          break;
        case 'delete':
          deleteTask(JSONObject.teamboard, JSONObject.task, _boardsObservabel);
          break;
      }
      break;


    case 'state':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addState(JSONObject.teamboard, JSONObject.task, JSONObject.column, _boardsObservabel);
          break;
        case 'delete':
          deleteState(JSONObject.teamboard, JSONObject.task, JSONObject.column, _boardsObservabel);
          break;
        case 'move':
          moveState(JSONObject.teamboard, JSONObject.task, JSONObject.column, _boardsObservabel);
          break;
      }
      break;

    case 'subtask':
      switch (JSONObject.type_of_edit) {
        case 'add':
          addSubtask(JSONObject.teamboard, JSONObject.task, JSONObject.column, JSONObject.subtask, _boardsObservabel);
          break;
        case 'delete':
          deleteSubtask(JSONObject.teamboard, JSONObject.task, JSONObject.column, JSONObject.subtask, _boardsObservabel);
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

function deleteState(boardId: number, taskId: number, column: State, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === boardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);

  const stateIndex = boardsArray[boardId].tasks[taskId].states.findIndex(state => state === column);

  if(stateIndex !== -1){
    boardsArray[boardId].tasks[taskId].states.splice(stateIndex, 1);
  }

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



