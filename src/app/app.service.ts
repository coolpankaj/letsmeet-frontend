import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private baseUrl = 'http://localhost:3000/api/v1';
  // private baseUrl = 'http://api.coolcoder.xyz/api/v1';

  constructor(private _http: HttpClient) { }

  public getCountryNames(): Observable<any> {
    return this._http.get('./../assets/countryNames.json');
  }

  public getCountryNumbers(): Observable<any> {
    return this._http.get('./../assets/countryPhoneCodes.json');
  }

  public signupFunction(data: any): Observable<any> {
    const params = new HttpParams()
    .set('firstName', data.firstName)
    .set('lastName', data.lastName)
    .set('email', data.email)
    .set('countryName', data.country)
    .set('mobileNumber', data.mobile)
    .set('password', data.password)
    .set('userName', data.username)
    .set('isAdmin', data.isAdmin)
    return this._http.post(`${this.baseUrl}/users/signup`, params)
  }
public loginFunction(data: any): Observable<any> {
 // console.log(data)
  const params = new HttpParams()
  .set('email', data.email)
  .set('password', data.password)
  return this._http.post(`${this.baseUrl}/users/login`, params)
}

public setUserInfoInLocalStorage = (data: any) => {
  localStorage.setItem('userInfo', JSON.stringify(data));
}
public getUserInfoFromLocalStorage: any = () => {
  return JSON.parse(localStorage.getItem('userInfo'));
}


public getUsers(authToken): Observable<any> {    
  return this._http.get(`${this.baseUrl}/users/view/all?authToken=${authToken}`);
}

public sentMeetingReminders(userId,authToken): Observable<any>{

  const params = new HttpParams()
    .set('userId', userId)
    .set('authToken', authToken)

  return this._http.post(`${this.baseUrl}/meetings/admin-meetings/sentReminders`, params);
}
  
public getUserAllMeeting(userId,authToken): Observable<any> {
    
  return this._http.get(`${this.baseUrl}/meetings/view/all/meetings/${userId}?authToken=${authToken}`);
}
public deleteMeeting(meetingId,authToken): Observable<any>{

  const params = new HttpParams()
    .set('authToken',authToken)

  return this._http.post(`${this.baseUrl}/meetings/${meetingId}/delete`, params);
}
public logout(userId,authToken): Observable<any>{

  const params = new HttpParams()
    .set('authToken',authToken)

  return this._http.post(`${this.baseUrl}/users/${userId}/logout`, params);
}

public addMeeting(data): Observable<any>{

  const params = new HttpParams()
    .set('meetingTopic', data.meetingTopic)
    .set('hostId', data.hostId)
    .set('hostName', data.hostName)
    .set('participantId', data.participantId)
    .set('participantName', data.participantName)
    .set('participantEmail',data.participantEmail)
    .set('meetingStartDate',data.meetingStartDate)
    .set('meetingEndDate',data.meetingEndDate)
    .set('meetingDescription',data.meetingDescription)
    .set('meetingPlace',data.meetingPlace)
    .set('authToken',data.authToken)

  return this._http.post(`${this.baseUrl}/meetings/addMeeting`, params);
}
public updateMeeting(data): Observable<any>{

  const params = new HttpParams()
    .set('meetingTopic', data.meetingTopic)
    .set('meetingStartDate',data.meetingStartDate)
    .set('meetingEndDate',data.meetingEndDate)
    .set('meetingDescription',data.meetingDescription)
    .set('meetingPlace',data.meetingPlace)
    .set('authToken',data.authToken)

  return this._http.put(`${this.baseUrl}/meetings/${data.meetingId}/updateMeeting`, params);
}
public getMeetingDetails(meetingId,authToken): Observable<any> {    
  return this._http.get(`${this.baseUrl}/meetings/${meetingId}/details?authToken=${authToken}`);
}
public resetPassword(data: any): Observable<any>{
  const params = new HttpParams()
    .set('email', data.email)
  return this._http.post(`${this.baseUrl}/users/reset-password`, params);
}

public updatePassword(data: any): Observable<any> {
  const params = new HttpParams()
  .set('validationToken', data.secret)
  .set('password', data.password)
  return this._http.put(`${this.baseUrl}/users/update-password`, params)
}

}
