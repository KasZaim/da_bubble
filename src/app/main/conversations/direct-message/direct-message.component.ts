import { Component, Input } from '@angular/core';
import { ChatComponent } from '../../chat/chat.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInfoComponent } from '../../../dialog-channel-info/dialog-channel-info.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ConversationsComponent } from '../conversations.component';
import { UsersList } from '../../../interfaces/users-list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { PofileInfoCardComponent } from '../../../pofile-info-card/pofile-info-card.component';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [ChatComponent, PickerComponent, 
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatDialogModule,
    ConversationsComponent,
    MatButtonToggleModule,
  ],

  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss'
})
export class DirectMessageComponent {
  isPickerVisible = false;
  @Input() sendedUser!: UsersList;
  
  constructor(public dialog: MatDialog,) {
  }
  ngOnInit() {
    console.log("Received sendedUser on init:", this.sendedUser);
  }

  togglePicker() {
    this.isPickerVisible = !this.isPickerVisible;
  }
  addEmoji(event: any) {
    console.log(event.emoji);
  }
  openDialogChannelInfo() {
    this.dialog.open(DialogChannelInfoComponent, {
      panelClass: 'custom-dialog-br',
    });
  }

  openProfileCard(){
    this.dialog.open(PofileInfoCardComponent,{
      data: this.sendedUser
    })

  openDialogAddMembers() {
    this.dialog.open(DialogAddMemberToChnlComponent, {
      panelClass: 'custom-dialog-br',
    });
  }
  openDialog(event: MouseEvent): void {
    let element = event.target as Element | null;

    if (element) {
      let htmlElement = element as HTMLElement;
      let boundingClientRect = htmlElement.getBoundingClientRect();

      let dialogPosition = {
        top: `${boundingClientRect.bottom + window.scrollY + 15}px`,
        left: `${boundingClientRect.left + window.scrollX - 280}px`,
      };

      this.dialog.open(DialogShowChannelMemberComponent, { // Ersetzen Sie DialogSomeComponent durch Ihre tatsächliche Dialogkomponente
        width: '350px',
        position: dialogPosition,
      });
    }

  }
}
