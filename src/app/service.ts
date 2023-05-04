import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {filter, from, map, observable, Observable, Observer, of, Subject, switchAll} from 'rxjs';
import '@cds/core/icon/register.js';
import '@cds/core/button/register.js';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {webSocket} from "rxjs/webSocket";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import {
  MessageAddUser,
  MessageAddBoard,
  MessageAddTask,
  MessageAddSubtask,
  MessageAddState,
  MessageDeleteBoard,
  MessageDeleteState,
  MessageDeleteSubtask,
  MessageDeleteTask,
  MessageMoveState,
  MessageMoveSubtask,
  MessageLoadBoards,
  MessageToken,
  MessageChangeName,
  MessageDeleteUser
} from './models/communication';

import {Board, Person, State, Subtask, Task} from './models/boards';


//const SOCKET_URL = "ws://localhost:8000";
const SOCKET_URL = "wss://teamboard.server-welt.com/ws/";

//https://www.piesocket.com/blog/python-websocket

let socket: WebSocket | undefined = undefined;


let aktualPerson: Person | null = null;
let boardsString: string[] = ["DefaultBoard"];


@Injectable({providedIn: 'root'})
export class Service {

  logout() {
    let message: MessageDeleteUser = {
      kind_of_object: 'user',
      type_of_edit: 'logout'
    }
    sendMessageToServer(JSON.stringify(message));
  }

  deleteUser() {
    let message: MessageDeleteUser = {
      kind_of_object: 'user',
      type_of_edit: 'delete'
    }
    sendMessageToServer(JSON.stringify(message));
  }

  initWebsocket(token: string, successCallback: () => void) {
    this.socketAuthentification = token;
    this._boardsObservable.subscribe(board => console.log(board));

    getWebSocket(token, this._boardsObservable, successCallback);
  }

  loadBoards() {

    //boardload
    const message: MessageLoadBoards = {
      kind_of_object: 'board',
      type_of_edit: 'load'
    }

    console.log("Sending Get boards...");

    sendMessageToServer(JSON.stringify(message));
  }

  private readonly _http = inject(HttpClient);


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

    boardsArray.push(newBoard);

    this._boardsObservable = of(boardsArray);
  }

  changeDescriptionFromSubtask(boardGet: Board, taskGet: Task, stateGet: State, subtaskGet: Subtask, inputValue: string) {

    let boardsArray: Board[] = getBoardsArray(this._boardsObservable);

    for (const boardsArrayElement of boardsArray) {
      if (boardsArrayElement.id === boardGet.id) {

        for (const tasksArrayElement of boardsArrayElement.tasks) {
          if (tasksArrayElement === taskGet) {

            for (const state of tasksArrayElement.states) {
              if (state === stateGet) {

                for (const subtask of state.subtasks) {
                  if (subtask.id == subtaskGet.id) {
                    subtask.description = inputValue;

                    //todo: send message to server
                  }
                }
              }
            }
          }
        }
      }
    }
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

    if (aktualPerson) {
      subtask.worker = aktualPerson!.email;
    }
    else{
      subtask.worker = localStorage.getItem('mail')!;
    }

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

  deleteTask(board: Board, task: Task) {
    let boardsArray: Board[] = [];

    if (this._boardsObservable !== undefined) {
      //move Observable to array to add subtask
      this._boardsObservable.subscribe(board => {
        boardsArray = board as Board[]
      });
    }

    const boardIndex = boardsArray.indexOf(board);

    let taskIndex = -1;
    if (boardIndex !== -1) {
      taskIndex = boardsArray.at(boardIndex).tasks.indexOf(task);
      boardsArray.at(boardIndex).tasks.splice(taskIndex, 1);
    }

    const message: MessageDeleteTask = {
      kind_of_object: "task",
      type_of_edit: "delete",
      teamboard: board,
      task: task
    }

    sendMessageToServer(JSON.stringify(message));

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


  public login(person: Person): Observable<MessageToken> {
    let socketAuth: string = '';

    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify(person);

    console.log('Not debug!', person.email, person.pwd);
    console.log("Sending data to server: ", body);

    aktualPerson = person;

    return this._http.post<MessageToken>('/api/login', person);

    // let response: MessageToken = {token: "test"}
    // return of(response)
  }

  forgetPW(email: string): Observable<Object> {
    return this._http.get('/api/send_reset_mail/' + email);
  }


  public register(person: Person): Observable<boolean> {
    return this._http.post<boolean>('/api/register/', person);

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

  addEmailToBoard(email: string, boardID: number) {
    const message: MessageAddUser = {
      kind_of_object: "teamboard",
      type_of_edit: "addUser",
      teamboard_id: boardID,
      email: email
    }
    sendMessageToServer(JSON.stringify(message));
  }

  deleteEmailFromBoard(email: string, boardID: number) {
    const message: MessageAddUser = {
      kind_of_object: "teamboard",
      type_of_edit: "deleteUser",
      teamboard_id: boardID,
      email: email
    }
    sendMessageToServer(JSON.stringify(message));
  }

  changeBoardName(boardID: number, newTitle: string) {
    const message: MessageChangeName = {
      kind_of_object: "teamboard",
      type_of_edit: "changeBoardName",
      teamboard_id: boardID,
      name_new: newTitle
    }
    sendMessageToServer(JSON.stringify(message));
  }
}

function getWebSocket(socketAuthentification: string, _boardsObservable: Observable<Board[]>, successCallback: () => void) {
  const webSocket = new WebSocket(SOCKET_URL + socketAuthentification);

  webSocket.onerror = (error) => {
    throw new Error(`WebSocket error: ${error}`);
  };

  const message: MessageLoadBoards = {
    kind_of_object: 'board',
    type_of_edit: 'load'
  }

  console.log("Sending Get boards...", JSON.stringify(message));

  webSocket.addEventListener("open", (event: any) => {
    // @ts-ignore
    webSocket.send(JSON.stringify(message));

    // Call the successCallback function to indicate that the WebSocket connection was established successfully
    successCallback();
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
        case 'load': {
          _boardsObservabel = loadBoards(JSONObject.teamboard, _boardsObservabel);
          break;
        }
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
          moveState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state, JSONObject.oldPosition, JSONObject.newPosition, _boardsObservabel);
          break;
        case 'moveSubtaskBetweenStates':
          moveSubtaskBetweenState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state_id, JSONObject.oldPosition, JSONObject.newPosition, JSONObject.subtask, _boardsObservabel);
          break;
        case 'moveSubtaskInStates':
          moveSubtaskInState(JSONObject.teamboard_id, JSONObject.task_id, JSONObject.state_id, JSONObject.oldPosition, JSONObject.newPosition, JSONObject.subtask, _boardsObservabel);
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

  loadBoards(JSONObject, _boardsObservabel);
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
    let board: Board[] = getBoardsArray(_boardsObservable);
  }

  const index = boardsArray.findIndex((board) => board.id === newBoard.id);

  //wenn nicht gefunden nichts machen
  if (index !== -1) {
    boardsArray.splice(index, 1);
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
}


function addTask(teamboard: number, newTask: Task, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === teamboard);

  const taskIndex: number = boardsArray[boardIndex].tasks.findIndex((task) => task.name === newTask.name);

  if (taskIndex === -1) {
    boardsArray[boardIndex].tasks.push(newTask);
  } else {
    boardsArray[boardIndex].tasks[taskIndex].id = newTask.id;
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
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

  if (taskIndex !== -1) {
    boardsArray[boardIndex].tasks.splice(taskIndex, 1);
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
}


function addState(boardId: number, taskId: number, column: State, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === boardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);

  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.state === column.state);

  if (stateIndex === -1) {
    boardsArray[boardIndex].tasks[taskIndex].states.push(column);
  } else {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].id = column.id;
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
}

function deleteState(boardId: number, taskId: number, stateGet: State, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === boardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);

  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.id === stateGet.id);

  if (stateIndex !== -1) {
    console.log("Delete Board");
    boardsArray[boardIndex].tasks[taskIndex].states.splice(stateIndex, 1);
  }
  console.log("initalice observable new..");
  _boardsObservable = addPositionsToBoards(of(boardsArray));
}


function moveState(teamboardID: number, taskID: number, state: State, oldPosition: number, newPosition: number, _boardsObservable: Observable<Board[]>) {

  if (newPosition == oldPosition) {
    _boardsObservable = addPositionsToBoards(_boardsObservable);
    _boardsObservable = sortBoards(_boardsObservable);
    return _boardsObservable;
  }

  let boardsArray: Board[] = getBoardsArray(_boardsObservable);
  let boardIndex = 0;
  let taskIndex = 0;

  for (let board of boardsArray) {
    if (board.id == teamboardID) {
      break;
    }
    boardIndex++;
  }

  for (let task of boardsArray[boardIndex].tasks) {
    if (task.id == taskID) {
      break;
    }
    taskIndex++;
  }

  //add new position
  if (boardsArray[boardIndex].tasks[taskIndex].states[newPosition].id == state.id) {
    console.log("If statement");
    _boardsObservable = addPositionsToBoards(_boardsObservable);
  } else {
    console.log("else statement");

    boardsArray[boardIndex].tasks[taskIndex].states[oldPosition].position = newPosition;

    for (let stateOfArray of boardsArray[boardIndex].tasks[taskIndex].states) {
      if (oldPosition < newPosition) {
        if ((stateOfArray.position < newPosition) && (stateOfArray.position > oldPosition)) {
          stateOfArray.position--;
        }
        if ((stateOfArray.position == newPosition) && (stateOfArray.id != state.id)) {
          stateOfArray.position--;
        }
      } else {
        if ((stateOfArray.position > newPosition) && (stateOfArray.position < oldPosition)) {
          stateOfArray.position++;
        }
        if ((stateOfArray.position == newPosition) && (stateOfArray.id != state.id)) {
          stateOfArray.position++;
        }
      }
      console.log("Switch position: Position:", stateOfArray.position);
    }
  }

  console.log(boardsArray);

  _boardsObservable = sortBoards(of(boardsArray));

  return _boardsObservable;
}


function addSubtask(teamboardId: number, taskId: number, columnId: number, subtask: Subtask, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = boardsArray.findIndex(board => board.id === teamboardId);
  const taskIndex = boardsArray[boardIndex].tasks.findIndex(task => task.id = taskId);
  const stateIndex = boardsArray[boardIndex].tasks[taskIndex].states.findIndex(state => state.id === columnId);


  const subtaskIndex = boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.findIndex(subtasks => subtasks.name === subtask.name);

  if (subtaskIndex === -1) {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.push(subtask);
  } else {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks[subtaskIndex].id = subtask.id;
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
}

function deleteSubtask(teamboardId: number, taskId: number, columnId: number, subtaskGet: Subtask, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);

  const boardIndex = getBoardPosition(boardsArray, teamboardId);
  const taskIndex = getTaskPosition(boardsArray[boardIndex].tasks, taskId);
  const stateIndex = getStatePosition(boardsArray[boardIndex].tasks[taskIndex].states, columnId);

  const subtaskIndex = boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.findIndex(subtask => subtask === subtaskGet);

  if (subtaskIndex !== -1) {
    boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks.splice(subtaskIndex, 1);
  }

  _boardsObservable = addPositionsToBoards(of(boardsArray));
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


function moveSubtaskBetweenState(teamboard_id: number, task_id: number, state_id: number, oldPosition: number, newPosition: number, subtask: Subtask, _boardsObservable: Observable<Board[]>) {
  let boardsArray: Board[] = getBoardsArray(_boardsObservable);
  let stateIndex = 0;
  let helpSubtask: Subtask | null = null;


  const boardIndex = getBoardPosition(boardsArray, teamboard_id);

  //find task position
  const taskIndex = getTaskPosition(boardsArray[boardIndex].tasks, task_id);

  //remove and copy state
  for (let state of boardsArray[boardIndex].tasks[taskIndex].states) {
    if ((state.subtasks.length > oldPosition) && (state.subtasks[oldPosition].id === subtask.id)) {
      helpSubtask = state.subtasks[oldPosition];
      state.subtasks.splice(oldPosition, 1);
      break;
    }
    stateIndex++;
  }

  if (helpSubtask === null) {
    throw Error("Error by moving subtask");
  }

  //count positions new
  let index = 0;
  for (let subtask of boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks) {
    subtask.position = index;
    index++;
  }

  //find position of new state
  let newStatePosition = getStatePosition(boardsArray[boardIndex].tasks[taskIndex].states, state_id);

  //change positions
  for (const subtask of boardsArray[boardIndex].tasks[taskIndex].states[newStatePosition].subtasks) {
    if (subtask.position >= newPosition) {
      subtask.position++;
    }
  }

  helpSubtask.position = newPosition;

  //add subtask
  boardsArray[boardIndex].tasks[taskIndex].states[newStatePosition].subtasks.push(helpSubtask);

  _boardsObservable = of(boardsArray);
  _boardsObservable = sortBoards(_boardsObservable);
}

function moveSubtaskInState(teamboard_id: number, task_id: number, state_id: number, oldPosition: number, newPosition: number, subtaskGet: Subtask, _boardsObservable: Observable<Board[]>): void {
  let boardsArray = getBoardsArray(_boardsObservable);

  const boardIndex = getBoardPosition(boardsArray, teamboard_id);
  const taskIndex = getTaskPosition(boardsArray[boardIndex].tasks, task_id);
  const stateIndex = getStatePosition(boardsArray[boardIndex].tasks[taskIndex].states, state_id);

  for (let subtask of boardsArray[boardIndex].tasks[taskIndex].states[stateIndex].subtasks) {
    //wurde der subtask nach oben oder nach unten geschoben
    if (oldPosition < newPosition) {
      //alle dazwischenliegenden aufrutschen
      if ((subtask.position > oldPosition) && (subtask.position <= newPosition) && (subtask.id !== subtaskGet.id)) {
        subtask.position--;
      }
    } else {
      //alle dazwischenliegenden aufrutschen
      if ((subtask.position < oldPosition) && (subtask.position >= newPosition) && (subtask.id !== subtaskGet.id)) {
        subtask.position++;
      }
    }
  }

  if (newPosition < oldPosition) {

  }

  _boardsObservable = of(boardsArray);
  _boardsObservable = sortBoards(_boardsObservable);

}


function loadBoards(JSONObject: any, _boardsObservabel: Observable<Board[]>): Observable<Board[]> {

  console.log("load boards..", JSONObject);

  let boardsArray: Board[] = getBoardsArray(_boardsObservabel);

  //pares Boards
  for (let i = 0; i < JSONObject.length; i++) {

    //parseTasks
    let tasks: Task[] = [];
    for (let j = 0; j < JSONObject[i].tasks.length; j++) {

      //pares states
      let states: State[] = [];
      for (let k = 0; k < JSONObject[i].tasks[j].states.length; k++) {

        //parse subtasks
        let subtasks: Subtask[] = [];
        for (let l = 0; l < JSONObject[i].tasks[j].states[k].subtasks.length; l++) {

          let newSubtask: Subtask = {
            id: JSONObject[i].tasks[j].states[k].subtasks[l].subtask_id,
            position: l,
            name: JSONObject[i].tasks[j].states[k].subtasks[l].name,
            description: JSONObject[i].tasks[j].states[k].subtasks[l].description,
            worker: JSONObject[i].tasks[j].states[k].subtasks[l].worker
          }

          subtasks.push(newSubtask);

        }

        let newState: State = {
          id: JSONObject[i].tasks[j].states[k].state_id,
          position: k,
          state: JSONObject[i].tasks[j].states[k].name,
          subtasks: subtasks,
        }

        states.push(newState);
      }

      let newTask: Task = {
        id: JSONObject[i].tasks[j].task_id,
        name: JSONObject[i].tasks[j].name,
        states: states
      }
      tasks.push(newTask);
    }

    let newBoard: Board = {
      id: JSONObject[i].teamboard_id,
      name: JSONObject[i].teamboard_name,
      tasks: tasks
    }

    boardsArray.push(newBoard);
  }

  _boardsObservabel = of(boardsArray);

  _boardsObservabel = addPositionsToBoards(_boardsObservabel);

  _boardsObservabel = sortBoards(_boardsObservabel);

  return _boardsObservabel;
}


function addPositionsToBoards(_boardsObservabel: Observable<Board[]>): Observable<Board[]> {
  let boardsArray: Board[] = getBoardsArray(_boardsObservabel);

  for (let board of boardsArray) {
    for (let task of board.tasks) {

      let statePosition = 0;
      for (let state of task.states) {
        state.position = statePosition;
        statePosition++;

        let subtaskPosition = 0;
        for (let subtask of state.subtasks) {
          subtask.position = subtaskPosition;
          subtaskPosition++;
        }
      }
    }
  }

  return of(boardsArray);
}

function sortBoards(_boardsObservabel: Observable<Board[]>): Observable<Board[]> {
  let boardsArray: Board[] = getBoardsArray(_boardsObservabel);

  for (let board of boardsArray) {
    for (let task of board.tasks) {
      let newStates: State[] = new Array(task.states.length);
      for (let state of task.states) {
        let newSubtasks: Subtask[] = new Array(state.subtasks.length);
        for (let subtask of state.subtasks) {
          newSubtasks[subtask.position] = subtask;
        }
        state.subtasks = newSubtasks;
        //sort states
        newStates[state.position] = state;
      }
      task.states = newStates;
    }
  }

  return of(boardsArray);
}

function getBoardPosition(boardsArray: Board[], teamboard_id: number): number {

  return boardsArray.findIndex(board => board.id === teamboard_id);
}

function getTaskPosition(taskArray: Task[], task_id: number): number {

  return taskArray.findIndex(task => task.id === task_id);
}

function getStatePosition(stateArray: State[], state_id: number): number {

  return stateArray.findIndex(state => state.id === state_id);

}

