import {Component, inject, Input} from '@angular/core';
import { NgModule } from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
// import { AppComponent } from './app.component';
import {Service, State, Subtask} from './service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Person, Service} from './service';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private toastr: ToastrService) {}
  private readonly service = inject(Service)
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  title = 'Teamboard-Client';

  todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];

  done = [
    'Get up',
    'Brush teeth',
    'Take a shower',
    'Check e-mail',
    'Walk dog'
  ];




  protected readonly _loginForm = this._formBuilder.group({
    email: ['', [Validators.required]],
    password:['', [Validators.required]],
  });

  protected readonly _registrationForm = this._formBuilder.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required]],
    password:['', [Validators.required]],
    password_wdh:['', [Validators.required]]
  });

  @Input()
  dep: any;
  
  // @ts-ignore
  _isChecked: any =  document.getElementById("isRegistration")?.checked;

  _websocketId: number = -1;
  protected _boards$ = this.service.getBoards().pipe();
  protected _tasks$ = this.service.getTasks().pipe();





  _login() {

    if(!this._loginForm.valid){
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    const person: Person = {
      username: '',
      email: this._loginForm.getRawValue().email,
      password: this._loginForm.getRawValue().password
    };

    this.service.login(person).subscribe({
      next: (webocketId: number) => {
        this._websocketId = webocketId;
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

  }

  _register() {
    if(!this._registrationForm.valid){
      this.toastr.error("Nicht alle Felder ausgefüllt");
      return;
    }

    const person_register = this._registrationForm.getRawValue();

    if(person_register.password !== person_register.password_wdh){
      this.toastr.error("Passwörter nicht identisch");
      // set form to invalid?
      return;
    }

    const person = {
      username: person_register.username,
      email: person_register.email,
      password: person_register.password
    }
    this.service.register(person).subscribe({
      next: (webocketId: number) => {
        this._websocketId = webocketId;
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
    }


  protected closeModal() {

  protected closeModal() {
    
    //remove logindialog
    const loginDialog = document.querySelector('.modal');
    loginDialog?.remove();

    //remove Backdrop
    const loginBackdrop = document.querySelector('.modal-backdrop');
    loginBackdrop?.remove();
  }

  showContent(boardName: string) {
    console.log(boardName);
  }

  drop(event: CdkDragDrop<Subtask[]>) {
    if (event.previousContainer === event.container) {
      console.log("if block")
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("else block")
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
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
}
