import {Component, inject} from '@angular/core';
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
    userType: ['local', [Validators.required]],
    username: ['', [Validators.required]],
    password:['', [Validators.required]],
    rememberMe: ['false'],
  });

  _login() {
    if(!this._loginForm.valid){
      return;
    }

    const person = this._loginForm.getRawValue();
    this.service.login(person);
  }
}
