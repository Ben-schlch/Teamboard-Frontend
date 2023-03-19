import {Component, inject, Input} from '@angular/core';
import { NgModule } from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
// import { AppComponent } from './app.component';
import {Service} from './service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private readonly service = inject(Service)
  private readonly _formBuilder = inject(NonNullableFormBuilder);
  title = 'Teamboard-Client';

  protected readonly _loginForm = this._formBuilder.group({
    username: ['', [Validators.required]],
    password:['', [Validators.required]],
  });

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






  _login() {
    //DELET
    this.closeModal();

    if(!this._loginForm.valid){
      return;
    }

    const person = this._loginForm.getRawValue();
    if(this.service.login(person)){
      
      this.closeModal();
    }
  }

  _register() {
    if(!this._registrationForm.valid){
      return;
    }

    const person_register = this._registrationForm.getRawValue();

    if(person_register.password !== person_register.password_wdh){
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
}
