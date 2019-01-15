import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { isSameDay,isSameMonth } from 'date-fns';

import { CalendarEvent, CalendarEventTimesChangedEvent} from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


import { AppService } from '../../app.service';
import { SocketService } from '../../socket.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;


   colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA'
    },
  
    green: {
      primary: '#008000',
      secondary: '#FDF1BA'
    }
  
    
  };
  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };
 
  refresh: Subject<any> = new Subject();

  activeDayIsOpen: boolean = false;

  public userInfo: any;
  public authToken: any;
  public receiverId: any;
  public receiverName: any;
  public meetings: any = [];
  public events: CalendarEvent[] = [];
  public remindMe: any;



  constructor(public socketService: SocketService,  private modal: NgbModal,public appService: AppService, public router: Router, public toastr: ToastrManager, private Cookie: CookieService) { }

  ngOnInit() {
    this.authToken = this.Cookie.get('authToken');
    this.receiverId = this.Cookie.get('receiverId');
    this.receiverName = this.Cookie.get('receiverName');
    this.remindMe = true
 
    this.userInfo = this.appService.getUserInfoFromLocalStorage()

    if(this.userInfo.isAdmin == false){

      this.verifyUserConfirmation()
      this.authErrorFunction(); 
      this.getUserAllMeetingFunction();
      this.getUpdatesFromAdmin();
    }
    else{
      this.router.navigate(['/user-dashboard']);      

    }
    
    setInterval(() => {
      this.meetingReminder();
    }, 5000);
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        
        this.view = 'day'
      }
    }
  }

  eventTimesChanged({event,newStart,newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
   
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  public meetingReminder(): any {
    let currentTime = new Date().getTime();
   
    for (let meetingEvent of this.meetings) {

      if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
        && new Date(meetingEvent.start).getTime() > currentTime) {
        if (meetingEvent.remindMe) {

          this.modalData = { action: 'clicked', event: meetingEvent };
          this.modal.open(this.modalAlert, { size: 'sm' });

          break;
        }

      }
      else if(currentTime > new Date(meetingEvent.start).getTime() && 
      new Date(currentTime - meetingEvent.start).getTime()  < 10000){
        this.toastr.infoToastr(`Meeting ${meetingEvent.meetingTopic} Started!`, `Gentle Reminder`);
      }  
    }

  }

 


  public getUserAllMeetingFunction = () => {
    this.appService.getUserAllMeeting(this.receiverId,this.authToken).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {

          this.meetings = apiResponse.data;
         

          for(let meetingEvent of this.meetings) {
              meetingEvent.title =  meetingEvent.meetingTopic;
              meetingEvent.start = new Date(meetingEvent.meetingStartDate);
              meetingEvent.end = new Date(meetingEvent.meetingEndDate);
              meetingEvent.color = this.colors.green;
              meetingEvent.remindMe = true

            }
          this.events = this.meetings;
          this.refresh.next();
    
          this.toastr.infoToastr("Calendar Updated", "Meetings Found!");
          //console.log(this.events)
  
        }
        else {
          this.toastr.errorToastr(apiResponse.message,"Error!");
          this.events = [];
        }
      },
      (error) => {
        if(error.status == 400){
          this.toastr.warningToastr("Calendar Failed to Update", "Either user or Meeting not found");
          this.events = []
        }
        else{
          this.toastr.errorToastr("Some Error Occurred", "Error!");
          this.router.navigate(['/server-error']);

        }
     }
    );
    }//end getAllUserMeetings
  
  public logoutFunction = () => {

      this.appService.logout(this.receiverId,this.authToken).subscribe(
        (apiResponse) => {
          if (apiResponse.status === 200) {
            localStorage.clear();
            this.Cookie.delete('authToken');
            this.Cookie.delete('receiverId');
            this.Cookie.delete('receiverName');
           
            this.socketService.disconnectedSocket();
            this.socketService.exitSocket();
            this.toastr.successToastr('Logged Out')
            this.router.navigate(['/login']);
          } else {
            this.toastr.errorToastr(apiResponse.message,"Error!")
           
          } 
        },
        (err) => {
          if(err.status == 404){
            this.toastr.warningToastr("Logout Failed", "Already Logged Out or Invalid User");
          }
          else{
            this.toastr.errorToastr("Some Error Occurred", "Error!");
            this.router.navigate(['/server-error']);
  
          }
      });
  
  }
    public verifyUserConfirmation: any = () => {
      this.socketService.verifyUser()
        .subscribe(() => {
          this.socketService.setUser(this.authToken);
  
        });
    }
  
    public authErrorFunction: any = () => {
      
      this.socketService.listenAuthError()
        .subscribe((data) => {
          console.log(data)        
  
        });
    }

  
    public getUpdatesFromAdmin= () =>{

      this.socketService.getUpdatesFromAdmin(this.receiverId).subscribe((data) =>{//getting message from admin.
        this.getUserAllMeetingFunction();
        this.toastr.infoToastr("Update From Admin!",data.message);
      });
    }
  

}
