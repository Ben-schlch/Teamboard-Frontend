import {Component, inject, Input} from '@angular/core';
import { NgModule } from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
// import { AppComponent } from './app.component';
import {Service, State, Subtask, Task} from './service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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



  //todo: add Email?
  protected readonly _loginForm = this._formBuilder.group({
    username: ['', [Validators.required]],
    password:['', [Validators.required]],
  });

  //todo: add Email
  protected readonly _registrationForm = this._formBuilder.group({
    username: ['', [Validators.required]],
    password:['', [Validators.required]],
    password_wdh:['', [Validators.required]]
  });
  // opened: boolean = true;
  //basic:any = true;

  @Input()
  dep: any;



  // @ts-ignore
  _isChecked: any =  document.getElementById("isRegistration")?.checked;

  protected _boards$ = this.service.getBoards();
  //protected _tasks$ = this.service.getTasks().pipe();


  protected _tasks$ = this.service.getTasks("null");


  _login() {
    //DELET
    this.closeModal();

    if(!this._loginForm.valid){
      return;
    }

    const person = this._loginForm.getRawValue();
    console.log(this.service.login(person));
    if(this.service.login(person)){
      this.closeModal();
      console.log("Close modal");
      return;
    }else{
      return;
    }
  }



  _register() {
    if(!this._registrationForm.valid){
      return;
    }

    const person_register = this._registrationForm.getRawValue();

    if(person_register.password !== person_register.password_wdh){

      alert("Passwörter nicht identisch");
      // set form to invalid?
      return;
    }

    const person = {
      username: person_register.username,
      password: person_register.password
    }
    if(this.service.register(person)){

      this.closeModal();

    }

  }


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

    this._tasks$ = this.service.getTasks(boardName);

  }

  drop(event: CdkDragDrop<Subtask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
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

  _addSubtask($event: MouseEvent, task: Task) {
    //todo: open modal to add
  }
}
