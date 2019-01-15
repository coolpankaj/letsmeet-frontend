import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AppService } from './../../app.service';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, Validators } from '@angular/forms';
import { ngxLoadingAnimationTypes } from 'ngx-loading';

/** settings for loading */
const PrimaryWhite = '#ffffff';
const SecondaryGrey = '#ccc';
const PrimaryRed = '#dd0031';
const SecondaryBlue = '#006ddd';

/*********************** */

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('ngxLoading') ngxLoadingComponent: LoginComponent;
  
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;
  public primaryColour = PrimaryWhite;
  public secondaryColour = SecondaryGrey;
  public coloursEnabled = false;
  public loadingTemplate: TemplateRef<any>;
  public config = { animationType: ngxLoadingAnimationTypes.none, primaryColour: this.primaryColour,backdropBorderRadius: '3px' };
  constructor(public appService: AppService, private fb: FormBuilder, public router: Router, public toastr: ToastrManager, private Cookie: CookieService) { }

  ngOnInit() {

  }
  loginForm = this.fb.group({
    email: ['', Validators.compose([Validators.email, Validators.required])],
    password: ['', Validators.required]
  })

  onSubmit() {
    this.loading = true;
    this.appService.loginFunction(this.loginForm.value)
      .subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        
        this.toastr.successToastr('Login successful', 'Welcome');
        
        this.Cookie.set('authToken', apiResponse.data.authToken)
        this.Cookie.set('receiverId', apiResponse.data.userDetails.userId)
        this.Cookie.set('receiverName', `${apiResponse.data.userDetails.firstName} ${apiResponse.data.userDetails.lastName}`)
        this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
        this.loginForm.reset()
        if(apiResponse.data.userDetails.isAdmin == true) {
         setTimeout(() => {
          this.router.navigate(['/admin-dashboard'])
          this.loading = false;
         }, 1500);
        } else {
         setTimeout(() => {
          this.router.navigate(['/user-dashboard'])
          this.loading = false;
         }, 1500);
        }

      } else  {
        this.loading = false;
        this.toastr.errorToastr(`${apiResponse.message}`, 'Error')
        this.loginForm.reset()

      }
    }, (err) => {
      this.loading = false;
      this.toastr.errorToastr(`${err.message}`, "Error!");
      this.router.navigate(['/server-error']);
      this.loginForm.reset()
    })
  }


}
