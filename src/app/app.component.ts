import {Component, inject, Input} from '@angular/core';
import { NgModule } from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule, ClrLoadingState } from '@clr/angular';
// import { AppComponent } from './app.component';
import {Board, Service, State, Subtask, Task} from './service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Person} from './service';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import {concat, forkJoin, from, map, mergeAll, Observable, of, Subject, Subscription, tap, zip } from 'rxjs';
import { ClarityIcons, userIcon, homeIcon, vmBugIcon, cogIcon, eyeIcon } from '@cds/core/icon';

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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected _createButtonState: ClrLoadingState = ClrLoadingState.DEFAULT;

  subscriber: Subscription;

  constructor(private toastr: ToastrService) {
    this.subscriber = this.service._boardsObservable.subscribe(boards => {
      this._boards$ = of(boards)
    });
    // if()
    // this.service._boardsObservable.subscribe(board => {
    //   console.log(board);
    //
    // })

  }
  private readonly service = inject(Service)
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  title = 'Teamboard-Client';



  protected readonly _loginForm = this._formBuilder.group({
    email: ['', [Validators.required]],
    pwd:['', [Validators.required]],
  });

  //todo: add Email
  protected readonly _registrationForm = this._formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    pwd:['', [Validators.required]],
    pwd_wdh:['', [Validators.required]]
  });

  ngOnInit() {
    this.service._boardsObservable.subscribe(d => this.boards = d);
    this._boards$ = this.service._boardsObservable;
  }

  @Input()
  dep: any;

  // @ts-ignore
  _isChecked: any =  document.getElementById("isRegistration")?.checked;

  //protected _boards$ = this.service.getBoards();
  //protected _tasks$ = this.service.getTasks().pipe();
  _websocketAuthentification: string = '';
  //protected _boards$: Observable<Board[]> = this.service._boardsObservable;

  _boards$ = this.service._boardsObservable.pipe(
    map(board => board)
  )

  protected boards: Board[] = [];

  // protected _boards$ = this.service._boardsObservable.pipe(
  //   map(board => board)
  // );

  //protected _tasks$ = this.service.getTasks().pipe();
  //protected _tasks$ = this.service.getTasks('null').pipe();

  _login() {
    this._createButtonState = ClrLoadingState.DEFAULT;

    if(!this._loginForm.valid){
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    this._createButtonState = ClrLoadingState.LOADING;

    const person: Person = {
      name: '',
      email: this._loginForm.getRawValue().email,
      pwd: this._loginForm.getRawValue().pwd
    };

    this.service.login(person).subscribe({
      next: (websocketAuthentification: string) => {
        this._websocketAuthentification = websocketAuthentification;
        this.closeModal();
        this.toastr.success('Logged in successfully')
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
    if(!this._registrationForm.valid){
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    const person_register = this._registrationForm.getRawValue();

    if(person_register.pwd !== person_register.pwd_wdh){
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
      next: (websocketAuthentification: string) => {
        this._websocketAuthentification = websocketAuthentification;
        this.closeModal();
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
        this.toastr.error(error.message);
      }
    });
    this.service._boardsObservable.subscribe(data => this._boards$ = of(data));
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

  // showContent(boardName: string) {
  //   console.log(boardName);
  //
  //   this._tasks$ = this.service.getTasks(boardName);
  //
  // }

  drop(event: CdkDragDrop<Subtask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      //send to service
    }
  }

  dropState(event: CdkDragDrop<State[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    //send to service
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
      if(_isState){
        // @ts-ignore
        return state.state;
      }

      if(state === state_get){
        _isState = true;
      }
    }
    return state_get.state;
  }

  _addSubtask(boardGet: Board, taskGet: Task, stateGet: State, taskName: string) {
    //todo: open modal to add

    //add task to observable

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
}
