import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay,  CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { Router, ActivatedRoute } from "@angular/router";
import { AppService } from "./../../app.service";
import { ToastrManager } from 'ng6-toastr-notifications';
import { CookieService } from 'ngx-cookie-service';
import { isSameDay, isSameMonth } from 'date-fns';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { SocketService } from "./../../socket.service";


const colors: any = {
  green: {
    primary: '#008000',
    secondary: '#FAE3E3'
  }
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('modalConfirmation') modalConfirmation: TemplateRef<any>;
  @ViewChild('modalAlert') modalAlert: TemplateRef<any>;

  
  view: string = 'month';

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];
  modalData: {
    action: string;
    event: CalendarEvent;
  };


  actions: CalendarEventAction[] = [
    {
      label: '<i><img src="./../../../assets/pencil-icon.png" height="20" width="20"></i>       ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i><img src="./../../../assets/Trash.png" height="20" width="20"></i>        ',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();


  public selectedUser: any;
  public allUsersData = [];
  public onlineUserList = [];
  public userInfo: any;
  public authToken;
  public receiverId: any;
  public meetings: any = [];
  public receiverName: string;
  public adminId: any;
  public adminName: any;
  public activeDayIsOpen: boolean = false;
  public gentleReminder: Boolean = true;


  constructor(  public socketService: SocketService,
    public _route: ActivatedRoute,private modal: NgbModal,public router: Router, public Cookie: CookieService, public appService: AppService, public toastr:ToastrManager) { }

  ngOnInit() {
    this.authToken = this.Cookie.get('authToken')
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    
    this.receiverId = this.Cookie.get('receiverId');
    this.receiverName = this.Cookie.get('receiverName');
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.adminId = this.Cookie.get('receiverId');
    this.adminName = this.Cookie.get('receiverName');
    this.verifyUserConfirmation()
    this.getAllUsers()
    this.getUserAllMeetingFunction()


   
    this.getOnlineUserList()

    setInterval(() => {
      this.meetingReminder();// function to send the reminder to the user
    }, 5000);

  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      //console.log('Day CLicked')
      this.viewDate = date;
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        //this.activeDayIsOpen = true;
        this.view = 'day'
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  deleteEvent(event: any): void {
    //console.log("Deleted...")

    this.deleteMeetingFunction(event);

    this.events = this.events.filter(iEvent => iEvent !== event);
    this.refresh.next();
    this.activeDayIsOpen = false;
  }


  public getAllUsers = () => {   
      this.appService.getUsers(this.authToken).subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.allUsersData = [];
          this.allUsersData = apiResponse.data;
          this.allUsersData.shift()
          this.toastr.infoToastr("User list updated");
        }
        else {
          this.toastr.errorToastr(apiResponse.message, "User Update");
        }
      },
        (error) => {
          this.toastr.errorToastr('Server error occured', "Error!");
          this.router.navigate(['/server-error']);

        }
      );
    }

    public verifyUserConfirmation: any = () => {
      this.socketService.verifyUser()
        .subscribe(() => {         
          this.socketService.setUser(this.authToken);  
        });
    }

    public getOnlineUserList: any = () => {
      this.socketService.onlineUserList()
        .subscribe((data) => {
  
          this.onlineUserList = []
          for (let x in data) {
            //let temp = { 'userId': x, 'userName': data[x] };
            this.onlineUserList.push(x);
          }
  
          for (let user of this.allUsersData) {
  
            if (this.onlineUserList.includes(user.userId)) {
              user.status = "online"
            } else {
              user.status = "offline"
            }
  
          }
  
        });//end subscribe
    }//end getOnlineUserList

    public getUserAllMeetingFunction = () => {//this function will get all the meetings of User. 
    
        this.appService.getUserAllMeeting(this.receiverId, this.authToken).subscribe((apiResponse) => {
          if (apiResponse.status == 200) {
            
            this.meetings = apiResponse.data;
  
            //console.log(this.meetings)
            for (let meetingEvent of this.meetings) {
              meetingEvent.title = meetingEvent.meetingTopic;
              meetingEvent.start = new Date(meetingEvent.meetingStartDate);
              meetingEvent.end = new Date(meetingEvent.meetingEndDate);
              meetingEvent.color = colors.green;
              meetingEvent.actions = this.actions
              meetingEvent.remindMe = true
              
            }
            this.events = this.meetings;
            //console.log(this.events)
            this.refresh.next();
  
            this.toastr.successToastr("Calendar Updated");
            //console.log(this.events)
  
          }
          else {
            this.toastr.errorToastr(apiResponse.message, "Error!");
            this.events = [];
          }
        },
          (error) => {
            if (error.status == 400) {
              this.toastr.warningToastr("Calendar Failed to Update", "Either user or Meeting not found");
              this.events = []
            }
            else {
              this.toastr.errorToastr("Some Error Occurred", "Error!");
              this.router.navigate(['/server-error']);
  
            }
          }
        );
  
      }
  
  
   public handleEvent(action: string, event: any): void {
      //console.log(event)
  
      if (action === 'Edited') {
        this.router.navigate([`/update-meeting/${event.meetingId}`]);
      }
  
      else if (action === 'Deleted') {
        console.log(action === 'Deleted')
  
        this.modalData = { event, action };
        this.modal.open(this.modalConfirmation, { size: 'lg' });
  
      }
      else {
        this.modalData = { event, action };
        this.modal.open(this.modalContent, { size: 'lg' });
      }
    }


    public getAdminMeetings(userId): any { 
      this.receiverId = this.userInfo.userId
      this.receiverName = this.adminName
      this.getUserAllMeetingFunction()
    }


  public sentMeetingRemindersonEmailFunction = () => {
        
      this.appService.sentMeetingReminders(this.adminId,this.authToken).subscribe((apiResponse) => {
        
        if (apiResponse.status == 200) {
          this.toastr.infoToastr("Meeting Reminders sent", "Update");

        }
        else {
          this.toastr.errorToastr(apiResponse.message, "Error!");
        }
      },
        (error) => {
          this.toastr.errorToastr('Server error occured', "Error!");
          this.router.navigate(['/server-error']);

        }
      );

    }

    public logoutFunction = (userId) => {
      this.appService.logout(userId, this.authToken).subscribe(
        (apiResponse) => {
          if (apiResponse.status === 200) {
            
            this.Cookie.delete('authToken');//delete all the cookies
            this.Cookie.delete('receiverId');
            this.Cookie.delete('receiverName');
            
            localStorage.clear();
            
            this.socketService.disconnectedSocket()
            this.socketService.exitSocket()  
            this.toastr.successToastr("Logged out")
              this.router.navigate(['/login']);           
  
          } else {
            this.toastr.errorToastr(apiResponse.message, "Error!")
            this.router.navigate(['/server-error']);
          } 
        },
        (err) => {
          if (err.status == 404) {
            this.toastr.warningToastr("Logout Failed", "Already Logged Out or Invalid User");
          }
          else {
            this.toastr.errorToastr("Some Error Occurred", "Error!");
            this.router.navigate(['/server-error']);
  
          }
        });
  
    }

    public getUserMeetings(userId,userName): any { //get meetings of clicked user ; 
      this.receiverId = userId
      this.receiverName = userName
      this.getUserAllMeetingFunction()
    }

    public goToAddMeeting(): any {
      this.router.navigate(['/create-meeting']);
    }

    public meetingReminder(): any {
      let currentTime = new Date().getTime();
      //console.log(this.meetings)
      for (let meetingEvent of this.meetings) {
  
        if (isSameDay(new Date(), meetingEvent.start) && new Date(meetingEvent.start).getTime() - currentTime <= 60000
          && new Date(meetingEvent.start).getTime() > currentTime) {
          if (meetingEvent.remindMe && this.gentleReminder) {
  
            this.modalData = { action: 'clicked', event: meetingEvent };
            this.modal.open(this.modalAlert, { size: 'sm' });
            this.gentleReminder = false
            break;
          }//end inner if
  
        }//end if
        else if(currentTime > new Date(meetingEvent.start).getTime() && 
        new Date(currentTime - meetingEvent.start).getTime()  < 10000){
          this.toastr.infoToastr(`Meeting ${meetingEvent.meetingTopic} Started!`, `Gentle Reminder`);
        }  
      }
  
    }

    public deleteMeetingFunction(meeting): any {
      this.appService.deleteMeeting(meeting.meetingId, this.authToken)
        .subscribe((apiResponse) => {
  
          if (apiResponse.status == 200) {
            this.toastr.successToastr("Deleted the Meeting", "Successfull!");
  
            let dataForNotify = {
              message: `Hi, ${this.receiverName} has canceled the meeting - ${meeting.meetingTopic}. Please Check your Calendar/Email`,
              userId: meeting.participantId
            }
  
            this.notifyUpdatesToUser(dataForNotify);
  
          }
          else {
            this.toastr.errorToastr(apiResponse.message, "Error!");
          }
        },
          (error) => {
  
            if (error.status == 404) {
              this.toastr.warningToastr("Delete Meeting Failed", "Meeting Not Found!");
            }
            else {
              this.toastr.errorToastr("Some Error Occurred", "Error!");
              this.router.navigate(['/serverError']);
  
            }
  
          });//end calling deletemeeting
  
    }

    public notifyUpdatesToUser: any = (data) => {
      //data will be object with message and userId(recieverId)
      this.socketService.notifyUpdates(data);
  
    }//end notifyUpdatesToUser
  
  
  
}