import {Component, inject, Input} from '@angular/core';
import {NgModule} from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ClarityModule, ClrLoadingState} from '@clr/angular';
// import { AppComponent } from './app.component';
import {Service} from './service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ToastrService} from 'ngx-toastr';
import {HttpStatusCode} from '@angular/common/http';
import {concat, forkJoin, from, map, mergeAll, Observable, of, Subject, Subscription, tap, zip} from 'rxjs';
import {ClarityIcons, userIcon, homeIcon, vmBugIcon, cogIcon, eyeIcon} from '@cds/core/icon';
import {FormsModule} from "@angular/forms";

// import 'clarity-icons';
// import 'clarity-icons/shapes/essential-shapes';
// import 'clarity-icons/shapes/technology-shapes';

import '@clr/icons';
import '@clr/icons/shapes/essential-shapes';
import '@clr/icons/shapes/media-shapes';
import '@clr/icons/shapes/social-shapes';
import '@clr/icons/shapes/travel-shapes';
import '@clr/icons/shapes/technology-shapes';
import '@clr/icons/shapes/chart-shapes';
import { Board, Task, State, Subtask, Person } from './models/boards';
import { MessageToken } from './models/communication';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
   _createButtonState: ClrLoadingState = ClrLoadingState.DEFAULT;

  subscriber: Subscription;

  constructor(private toastr: ToastrService) {
    this.subscriber = this.service._boardsObservable.subscribe(boards => {
      this._boards$ = of(boards)
    });

  }

  private readonly service = inject(Service)
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  title = 'Teamboard-Client';


  protected readonly _loginForm = this._formBuilder.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  //todo: add Email
  protected readonly _registrationForm = this._formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    pwd: ['', [Validators.required]],
    pwd_wdh: ['', [Validators.required]]
  });

  ngOnInit() {
    this.service._boardsObservable.subscribe(d => this.boards = d);
    this._boards$ = this.service._boardsObservable;

    this._boards$.subscribe();
  }

  @Input()
  dep: any;


  // // @ts-ignore
  // _isChecked: any =  document.getElementById("isRegistration")?.checked;
  _websocketAuthentification: string = '';

  _boards$ = this.service._boardsObservable.pipe(
    map(board => board)
  )

  protected boards: Board[] = [];

  _login() {

    if (!this._loginForm.valid) {
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    this._createButtonState = ClrLoadingState.LOADING;

    const person: Person = {
      name: '',
      email: this._loginForm.getRawValue().email,
      pwd: this._loginForm.getRawValue().password
    };

    this.service.login(person).subscribe({
      next: (tokenmessage: MessageToken) =>{
        this.closeModal();
        this.toastr.success('Logged in successfully');

        this.service.initWebsocket(tokenmessage.token);
      },
      error: (error) => {
        switch (error.status) {
          case HttpStatusCode.NotFound:
            this.toastr.error('Login failed, server unreachable');
            break;
          case HttpStatusCode.NotAcceptable:
            this.toastr.error('Login failed, you are not a correct User');
            break;
          default:
            this.toastr.error('Login failed');
        }
      },
    });

    this._createButtonState = ClrLoadingState.DEFAULT;
  }


  _register() {
    this._createButtonState = ClrLoadingState.DEFAULT;
    if (!this._registrationForm.valid) {
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    const person_register = this._registrationForm.getRawValue();

    if (person_register.pwd !== person_register.pwd_wdh) {
      this.toastr.error("Passwörter nicht identisch");
      // set form to invalid?
      return;
    }
    this._createButtonState = ClrLoadingState.LOADING;

    const person = {
      name: person_register.name,
      email: person_register.email,
      pwd: person_register.pwd
    }
    this.service.register(person).subscribe({
      next: () => {
          this.toastr.info('You will get an Email to validate');


      },
      error: (error) => {
        switch (error.status) {
          case HttpStatusCode.NotFound:
            this.toastr.error('Registration failed, server unreachable');
            break;
          case HttpStatusCode.NotAcceptable:
            this.toastr.error('Registration failed, you are not a correct User');
            break;
          default:
            this.toastr.error('Registration failed');
        }
      }
    });
    this._createButtonState = ClrLoadingState.DEFAULT;
  }


  protected closeModal() {

    //remove logindialog
    const loginDialog = document.querySelector('.modal');
    loginDialog?.remove();

    //remove Backdrop
    const loginBackdrop = document.querySelector('.modal-backdrop');
    loginBackdrop?.remove();

  }

  drop(event: CdkDragDrop<Subtask[]>, boardGet: Board, taskGet: Task, stateGet: State) {

    this.service.moveSubtask(event, boardGet, taskGet, stateGet);
  }

  dropState(event: CdkDragDrop<State[]>, boardGet: Board, taskGet: Task) {
    this.service.dropState(event, boardGet, taskGet);
  }

  _getSubtasks(subtasks: Subtask[]): string[] {
    let subtaskString = [];

    for (const subtask of subtasks) {
      subtaskString.push(subtask.name);
    }
    return subtaskString;
  }

  _getStates(states: State[]): string[] {
    let statesStrings = [];

    for (const state of states) {
      statesStrings.push(state.state)
    }

    return statesStrings;
  }

  _getNextState(states: State[], state_get: State): string {
    let _isState = false;

    for (const state of states) {
      if (_isState) {
        // @ts-ignore
        return state.state;
      }

      if (state === state_get) {
        _isState = true;
      }
    }
    return state_get.state;
  }

  _addSubtask(boardGet: Board, taskGet: Task, stateGet: State, taskName: string) {
    //todo: open modal to add??

    //add task to observable

    if(taskName == ""){
      return;
    }

    let newSubtask: Subtask = {
      name: taskName,
      description: '',
      worker: '',
      id: -1,
      position: stateGet.subtasks.length
    }

    this.service.addSubtask(boardGet, taskGet, stateGet, newSubtask);
  }

  _addTask(taskName: string, boardGet: Board) {

    //open modal to add
    let newTask: Task = {
      name: taskName,
      states: [],
      id: -1
    }

    this.service.addTask(boardGet, newTask);
  }


  _addState(boardGet: Board, taskGet: Task, stateName: string) {
    //todo: add state

    let newState: State = {
      id: -1,
      state: stateName,
      subtasks: [],
      position: 0
    }

    this.service.addState(boardGet, taskGet, newState);
  }

  _addBoard(boardName: string) {
    let newBoard: Board = {
      id: -1,
      name: boardName,
      tasks: []
    }

    this.service.addBoard(newBoard);
  }

  _deleteBoard(board: Board) {
    this.service.deleteBoard(board);
  }

  _deleteState(boardGet: Board, taskGet: Task, stateGet: State) {
    console.log("Delete state", stateGet);
    this.service.deleteState(boardGet, taskGet, stateGet);
  }


  _addUserToBoard(board: Board) {
    var email = prompt("Geben Sie die E-Mail ein, die zum Teamboard \"" + board.name + "\" hinzugefügt werden soll:", "example@mail.com");

    if (validateEmail(email) && email) {
      this.toastr.success('E-Mail valid, user was invited to the teamboard!')
      this.service.addEmailToBoard(email, board.id);
    } else {
      this.toastr.error('E-Mail not valid!')
    }
  }

  _deleteUserFromBoard(board: Board) {
    var email = prompt("Geben Sie die E-Mail ein, die vom Teamboard \"" + board.name + "\" gelöscht werden soll:", "example@mail.com");

    if (validateEmail(email) && email) {
      this.toastr.success('E-Mail valid, user was removed from teamboard!')
      this.service.deleteEmailFromBoard(email, board.id);
    } else {
      this.toastr.error('E-Mail not valid!')
    }
  }

  changeDescription(boardGet: Board, taskGet: Task, stateGet: State, subtaskGet: Subtask, inputValue: string) {
    this.service.changeDescriptionFromSubtask(boardGet, taskGet, stateGet, subtaskGet, inputValue);
  }

  _deletUser() {
    this.service.deleteUser();
    window.location.reload();
  }

  _logout() {
    this.service.logout();
    window.location.reload();
  }
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



function validateEmail(email: string | null) {
  const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return res.test(String(email).toLowerCase());
}

function sortBoards(_boards$: Observable<Board[]>): Observable<Board[]> {
  let boardsArray: Board[] = getBoardsArray(_boards$);

  //todo: sort boards

  return of(boardsArray);
}
