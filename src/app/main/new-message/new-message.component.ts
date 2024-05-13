import { CommonModule } from '@angular/common';
import { Component,OnInit  } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIcon, MatIconModule, } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { DirectmessageService } from '../chat/direct-message/directmessage.service';
import { MatDialogActions, MatDialogContent, } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipGrid, MatChipsModule } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { UsersList } from '../../interfaces/users-list';
import { ChatService } from '../chat/chat.service';
import { Observable, map, startWith } from 'rxjs';
@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    FormsModule,
    PickerComponent,
    MatMenuModule,
    CommonModule,
    MatDialogContent,
    MatInputModule,
    MatDialogActions,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatChipGrid,
    MatChipsModule,
    MatOption,
    MatIcon,
    MatAutocomplete,

  ],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements OnInit {
  messageText: string = '';
  startsWith: string = '';
  isPickerVisible = false;
  finished: boolean = false;
  removable = true;
  filteredOptions!: Observable<UsersList[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  nameControl = new FormControl();
  addedMembers: UsersList[] = [];


  constructor(public DMSerivce: DirectmessageService, public chatService : ChatService) {
    
  }
  ngOnInit() {
    this.filteredOptions = this.nameControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }
  togglePicker() {
    this.isPickerVisible = !this.isPickerVisible;
  }
  addEmoji(event: any) {
    console.log(event.emoji);
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  public addSingleUser(userName: string){
    for (const user of this.chatService.usersList){
      if (user.name === userName && this.addedMembers.indexOf(user) === -1) this.addedMembers.push(user)
    }
  }
  private _filter(value: string): UsersList[] {
    const filterValue = value.toLowerCase();
    return this.chatService.usersList.filter(option => option.name.toLowerCase().includes(filterValue));
  }
  public removeUser(user: UsersList){
    const userIndex = this.addedMembers.indexOf(user);
    if (userIndex === -1) throw new Error(`No user with id ${user.id} found`)
    this.addedMembers.splice(userIndex, 1)
  }
  getAvatarPath(avatarNumber: string): string {
    return `./../../assets/img/avatar/${avatarNumber}.svg`;
  }

  finishInput() {
    if (this.startsWith.startsWith('#')) {
      this.finished = true;
    }else{
      this.finished = false;
    }
    
  }
  
}
