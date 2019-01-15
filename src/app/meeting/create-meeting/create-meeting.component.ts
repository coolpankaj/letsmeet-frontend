import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.component.html',
  styleUrls: ['./create-meeting.component.css']
})
export class CreateMeetingComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;


  public selectedUser: any;
  public allUsers: any[];
  public allUsersData: any[];
  public subject: any;
  public description: any;  
  public startDate1: any;
  public endDate1: any;
  public venue: any;
  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public adminName: any;

  constructor(public Cookie: CookieService,  public appService: AppService, public socketService: SocketService, public _route: ActivatedRoute, public router: Router, private toastr: ToastrManager, private modal: NgbModal) { }

  ngOnInit() {
    this.authToken = this.Cookie.get('authToken');
    this.receiverId = this.Cookie.get('receiverId');
    this.receiverName = this.Cookie.get('receiverName');
    this.adminName = this.Cookie.get('receiverName');

    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    if(this.userInfo.isAdmin == true){
      this.getAllUsers();
    }else{
      this.router.navigate(['/user-dashboard']);      
    }
  
  }

  public getSelected = (user) => {
    this.selectedUser = user
  }

  public goToAdminDashboard(): any {
    this.router.navigate(['/admin-dashboard']);
  }
  public createMeetingFunction(): any {

    if (!this.subject) {
      this.toastr.warningToastr("Subject is required", "Warning!");
    }
    else if (!this.description) {
      this.toastr.warningToastr("Description is required", "Warning!");
    }
    else if (!this.selectedUser) {
      this.toastr.warningToastr("Participant is required", "Warning!");
    }
    else if (!this.startDate1) {
      this.toastr.warningToastr("Start Date/Time is required", "Warning!");
    }
    else if (!this.endDate1) {
      this.toastr.warningToastr("End Date/Time is required", "Warning!");
    }
    else if (!this.venue) {
      this.toastr.warningToastr("Venue is required", "Warning!");
    }
    else if (this.validateDate(this.startDate1 ,this.endDate1)) {
      this.toastr.warningToastr("End Date/Time cannot be before Start Date/Time", "Warning!");
    }
    else if (this.validateCurrentDate(this.startDate1) && this.validateCurrentDate(this.endDate1)) {
      this.toastr.warningToastr("Meeting can't be schedule in back date/time", "Warning!");
    }
    else {
      let data = {
        meetingTopic: this.subject,
        hostId: this.receiverId,
        hostName:this.receiverName,
        participantId:this.selectedUser.userId,
        participantName:this.selectedUser.firstName + ' ' + this.selectedUser.lastName,
        participantEmail:this.selectedUser.email,
        meetingStartDate:this.startDate1.getTime(),
        meetingEndDate:this.endDate1.getTime(),
        meetingDescription:this.description,
        meetingPlace:this.venue,
        authToken:this.authToken
      }
  
      console.log(data)  
      this.appService.addMeeting(data).subscribe((apiResponse) => {
  
          if (apiResponse.status == 200) {
            this.toastr.successToastr("We emailed the final schedule to participant", "Meeting Finalized");
   
            let dataForNotify = {
              message: `Hi, ${data.hostName} has Schedule a Meeting With You. Please check your Calendar/Email`,
              userId:data.participantId
            }
  
            this.notifyUpdatesToUser(dataForNotify);
            setTimeout(() => {
              this.goToAdminDashboard();
            }, 1000);//redirecting to admin dashboard page
  
          }
          else {
            this.toastr.errorToastr(apiResponse.message, "Error!");
          }
        },
          (error) => {
            if(error.status == 400){
              this.toastr.warningToastr("Meeting Schedule Failed", "One or more fields are missing");
            }
            else{
              this.toastr.errorToastr("Some Error Occurred", "Error!");
              this.router.navigate(['/server-error']);
  
            }
        });//end calling addMeeting
    }
    }//end addMeeting function
  
  
    public getAllUsers = () => { 
      if(this.authToken){
        this.appService.getUsers(this.authToken).subscribe(
          (apiResponse) => {
            if (apiResponse.status == 200) {
              this.allUsersData = apiResponse.data;
              this.allUsers = []
              for(let i = 0; i < this.allUsersData.length; i++) {
                let user = this.allUsersData[i].firstName + ' ' + this.allUsersData[i].lastName;
                if(user != undefined) {
                    this.allUsers.push(user);
                }
            }
        
              //this.toastr.info("Update", "All users listed");
              //console.log(this.allUsers)
       
            }
            else {
              this.toastr.errorToastr(apiResponse.message,"Error!");
            }
          },
          (error) => {
            this.toastr.errorToastr('Server error occured');
          }
        );//end get users
      
      }//end if
      else{
        this.toastr.infoToastr("Missing Authorization Key", "Please login again");
        this.router.navigate(['/login']);
  
      }
  
  
  }//end getAllUsers
  
  
    /* Events based Functions */
  
    //emitted 
  
    public notifyUpdatesToUser: any = (data) => {
      //data will be object with message and userId(recieverId)
      this.socketService.notifyUpdates(data);
    }//end notifyUpdatesToUser
  
    public viewScheduledMeetingFunction: any = () => {
      this.modal.open(this.modalContent, { size: 'lg' });
    }

    public validateDate(startDate:any, endDate:any):boolean {//method to validate the the start and end date of meeting .

      let start = new Date(startDate);
      let end = new Date(endDate);
  
      if(end < start){
        return true;
      }
      else{
        return false;
      }
  
    }//end validateDate
  
  
    public validateCurrentDate(startDate:any):boolean {//method to validate the current date and date of meeting .
  
      let start = new Date(startDate);
      let end : any = new Date();
  
      if(end > start){
        return true;
      }
      else{
        return false;
      }
  
    }//end validateDate
  
  

}
