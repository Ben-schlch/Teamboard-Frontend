import {Component, inject, Input} from '@angular/core';
import { NgModule } from '@angular/core';
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
// import { AppComponent } from './app.component';
import {Service} from './service';
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

  _websocketId: number = -1;




  _login() {
    //DELET
    this.closeModal();

    if(!this._loginForm.valid){
      return;
    }

    const person = this._loginForm.getRawValue();
    this.service.login(person).subscribe({
      next: (webocketId: number) => {
        this._websocketId = webocketId;
        this.closeModal();
        this.toastr.success('Logged in successfully')
      },
      error: (error) => {
        switch (error.status) {
          case HttpStatusCode.ExpectationFailed:
            this.toastr.error('Login failed, server unreachable');
            break;
          case HttpStatusCode.NotAcceptable:
            this.toastr.error('Login failed, you are not a correct User');
            break;
          default:
            this.toastr.error('Login failed');
        }

        this.toastr.error(error.message);
      },
    });

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
    this.service.register(person).subscribe({
      next: (webocketId: number) => {
        this._websocketId = webocketId;
        this.closeModal();
      },
      error: (error) => {
        this.toastr.error(error.message);
      }
    });
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
