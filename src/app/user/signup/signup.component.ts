import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AppService } from "./../../app.service";
import { ToastrManager } from 'ng6-toastr-notifications';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  allCountries: any; 
  countries = [];
  country;
  countryCode: any;
  countryName: any;
  countryCodes = [];
  adminError:Boolean = false;

  constructor(public fb: FormBuilder, public appService: AppService, public toastr: ToastrManager, public router: Router) { }

  ngOnInit() {
    this.getCountries()
    this.getCountryCodes();
  }

  public onChangeOfCountry() {
    const selectedCountry = this.signupForm.value.country;   
    this.countryCode = this.countryCodes[selectedCountry];
    this.countryName = this.allCountries[selectedCountry];
  }
 
  signupForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    email: [null, Validators.compose([Validators.required, Validators.email])],
    password: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
    country: [null, Validators.required],
    mobile: [null, Validators.compose([Validators.required, Validators.pattern(/^[0-9]{10}$/)])],
    username: ['', Validators.required],
    isAdmin: [false]
  })
public getCountries() {
    this.appService.getCountryNames().subscribe(data => {
      this.allCountries = data;
      for(let current in data) {
        let singleCountry = {
          name: data[current],
          code: current
        }
        this.countries.push(singleCountry);
      }
      this.countries = this.countries.sort((first, second) => {
        return first.name > second.name ? 1 : (first.name < second.name ?  -1 :  0)
      })
    })
   
  } 

  public getCountryCodes() {
    this.appService.getCountryNumbers()
      .subscribe(data => {
        this.countryCodes = data;
      })
  }

public  checkValue() {
    if(this.signupForm.value.isAdmin) {
      if( !this.signupForm.value.username.endsWith('-admin')) {
          this.adminError = true;
      }       
    } else {
      this.adminError = false;
    } 
  } 

  onSubmit() {
    
   this.appService.signupFunction(this.signupForm.value).subscribe(apiResponse => {
      if(apiResponse.status === 200) {
        this.toastr.successToastr('SignUp Complete', 'Welcome')
        setTimeout(() => {
          this.router.navigate(['/login'])
        }, 1500);
      } else {
            this.toastr.errorToastr(apiResponse.message, 'Error')
            
      }
    }, (error) => {
      this.toastr.errorToastr("Some Error Occurred", "Error!");
      this.router.navigate(['/server-error']);
    })
  }



}
