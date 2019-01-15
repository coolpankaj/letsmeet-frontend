import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule } from 'ng6-toastr-notifications';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./user/login/login.component";
import { SignupComponent } from "./user/signup/signup.component";
import { UserModule } from "./user/user.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MeetingModule } from "./meeting/meeting.module";
import { AdminDashboardComponent } from "./dashboard/admin-dashboard/admin-dashboard.component";
import { UserDashboardComponent } from "./dashboard/user-dashboard/user-dashboard.component";
import { CookieService } from 'ngx-cookie-service';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { UpdateMeetingComponent } from './meeting/update-meeting/update-meeting.component';
import { CreateMeetingComponent } from './meeting/create-meeting/create-meeting.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ForgotPasswordComponent } from './user/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { NgxLoadingModule } from 'ngx-loading';
 

@NgModule({
  declarations: [
    AppComponent, 
    PageNotFoundComponent,
    ServerErrorComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    FormsModule, 
    ReactiveFormsModule,
    UserModule,
    DashboardModule,
    MeetingModule,
    HttpClientModule, 
    NgbModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    ToastrModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    RouterModule.forRoot([
      { path: "login", component: LoginComponent },
      { path: "signup", component: SignupComponent },
      { path: "forgot-password", component: ForgotPasswordComponent },
      { path: "reset-password", component: ResetPasswordComponent },
      { path: "user-dashboard", component: UserDashboardComponent },
      { path: "admin-dashboard", component: AdminDashboardComponent },
      { path: "create-meeting", component: CreateMeetingComponent },
      { path: "update-meeting/:meetingId", component: UpdateMeetingComponent },
      { path: "server-error", component: ServerErrorComponent },
      { path: "", redirectTo: "login", pathMatch: "full" },
      { path: "*", component: PageNotFoundComponent },
      { path: "**", component: PageNotFoundComponent }
  ]),
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory
  })
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
