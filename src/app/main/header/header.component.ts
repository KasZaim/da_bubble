import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { DialogEditProfileComponent } from "../../dialog-edit-profile/dialog-edit-profile.component";
import { FirestoreService } from "../../firestore.service";
import { DocumentData, doc, onSnapshot } from "@angular/fire/firestore";
import { UsersList } from "../../interfaces/users-list";
import { CurrentuserService } from "../../currentuser.service";
import { CommonModule, NgClass } from "@angular/common";
import { ChatService } from "../chat/chat.service";
import {
    MatBottomSheet,
    MatBottomSheetModule,
    MatBottomSheetRef,
} from "@angular/material/bottom-sheet";
import { BottomsheetProfileMenuComponent } from "../../bottomsheet-profile-menu/bottomsheet-profile-menu.component";
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Observable, map, startWith, switchMap } from "rxjs";
import { NewMessageOption } from "../../interfaces/new-message-option";
import { MatInputModule } from "@angular/material/input";
import { DirectmessageService } from "../chat/direct-message/directmessage.service";
import { SearchResult } from "../../interfaces/search-result";

@Component({
    selector: "app-header",
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatDialogModule,
        DialogEditProfileComponent,
        NgClass,
        MatBottomSheetModule,
        MatFormFieldModule,
        FormsModule,
        CommonModule,
        MatAutocompleteModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.scss",
})
export class HeaderComponent {
    formCtrl = new FormControl("");
    filteredResults: Observable<SearchResult[]>;

    @ViewChild("searchInput")
    searchInput!: ElementRef<HTMLInputElement>;

    constructor(
        public dialog: MatDialog,
        public currentuser: CurrentuserService,
        private chatService: ChatService,
        private _bottomSheet: MatBottomSheet,
        public DMService: DirectmessageService,
    ) {
        this.filteredResults = this.formCtrl.valueChanges.pipe(
            startWith(""),
            switchMap((value) =>
                value
                    ? this._filter(value)
                    : this.getAvailableMessages().then((messages) => messages),
            ),
        );
    }

    openDialog(event: MouseEvent): void {
        // Sicherstellen, dass event.target tatsächlich ein Element ist.
        let element = event.target as Element | null;

        if (element) {
            // Casten zu HTMLElement, um Zugriff auf getBoundingClientRect zu gewährleisten.
            let htmlElement = element as HTMLElement;
            let boundingClientRect = htmlElement.getBoundingClientRect();

            // Berechnung der Position, um den Dialog unterhalb des Pfeils zu positionieren.
            let dialogPosition = {
                top: `${boundingClientRect.bottom + window.scrollY + 31}px`, // Plus window.scrollY für absolute Positionierung auf der Seite
                right: `${window.innerWidth - boundingClientRect.left - boundingClientRect.width + window.scrollX}px`,
            };

            this.dialog.open(DialogEditProfileComponent, {
                position: dialogPosition,
            });
        }
    }

    isMobileOpen(string: string) {
        return this.chatService.mobileOpen === string;
    }

    mobileGoBack() {
        this.chatService.mobileOpen = "";
        this.chatService.selectedChannel = "";
        this.chatService.selectedDirectmessage = "";
    }

    mobileMenu() {
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.openBottomSheet();
        }
    }

    log() {
        console.log(this.getChannelMessages());
    }

    openBottomSheet(): void {
        this._bottomSheet.open(BottomsheetProfileMenuComponent);
    }

    async getAvailableMessages(): Promise<SearchResult[]> {
        const currentUserId = this.currentuser.currentUserUid;
        await this.DMService.getAllMessages(); // Aufrufen und auf das Laden der Nachrichten warten

        console.log("All direct messages:", this.DMService.allMessages);
        console.log(
            "All direct messages (stringified):",
            JSON.stringify(this.DMService.allMessages, null, 2),
        );

        const directMessages: SearchResult[] = [];

        Object.entries(this.DMService.allMessages).forEach(
            ([userId, messages]) => {
                Object.entries(messages).forEach(([messageId, message]) => {
                    directMessages.push({
                        type: "user" as const,
                        id: messageId,
                        name: message.name,
                        avatar: message.avatar,
                        message: message.message,
                        userID: userId,
                    });
                });
            },
        );

        console.log("Direct messages:", directMessages);

        // Durchlaufe die Kanalliste und filtere nur die Kanäle, in denen der Benutzer Mitglied ist
        let channelMessages: SearchResult[] = [];
        this.chatService.channelsList
            .filter((channel) => {
                const isMember = channel.channelData.members.some(
                    (member) => member.id === currentUserId,
                );
                console.log(`Channel ${channel.id} is member:`, isMember);
                return isMember;
            })
            .forEach((channel) => {
                // Für jeden Kanal, in dem der Benutzer ist, extrahiere die Nachrichten
                if (channel.channelData.messages) {
                    const messages = Array.from(
                        channel.channelData.messages.values(),
                    ).map((message) => ({
                        type: "channel" as const,
                        id: message.id,
                        name: message.name,
                        avatar: message.avatar,
                        message: message.message,
                        channelName: channel.channelData.name,
                        channelID: channel.id,
                    }));
                    console.log(
                        `Messages for channel ${channel.id}:`,
                        messages,
                    );
                    channelMessages = channelMessages.concat(messages); // Füge die umgewandelten Nachrichten dem Array hinzu
                }
            });

        console.log("Channel messages:", channelMessages);

        const allMessages = [...directMessages, ...channelMessages];
        console.log("All messages:", allMessages);

        return allMessages;
    }

    getChannelMessages() {
        console.log(this.chatService.channelsList);
        let availableChannelMessages: SearchResult[] = [];

        this.chatService.channelsList
            .filter((channel) =>
                channel.channelData.members.some(
                    (member) => member.id === this.currentuser.currentUser.id,
                ),
            )
            .forEach((channel) => {
                if (channel.channelData) console.log(channel.channelData);
                channel.channelData.messages?.forEach((message) => {
                    console.log("hallo");
                    availableChannelMessages.push({
                        type: "channel",
                        id: message.id,
                        name: message.name,
                        avatar: message.avatar,
                        message: message.message,
                        channelName: channel.channelData.name,
                        channelID: channel.id,
                    });
                });
            });

        return availableChannelMessages;
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        // const value = (event.option.value || '').trim();
        // const selectedOption = this.getAvailableMessages().find(option => option.id === value);
        // if (selectedOption) {
        //   if (selectedOption.type === 'user') {
        //     // this.openDirectMessage(selectedOption.id);
        //     this.chatService.setComponent('directMessage');
        //   } else if (selectedOption.type === 'channel') {
        //     // this.openChannel(selectedOption.id);
        //     this.chatService.setComponent('chat');
        //   }
        // }
        // this.searchInput.nativeElement.value = '';
        // this.formCtrl.setValue(null);
    }

    private async _filter(value: string): Promise<SearchResult[]> {
        const filterValue = value.toLowerCase();

        const allCategorys = await this.getAvailableMessages();

        const filteredUsers = allCategorys.filter(
            (option) =>
                option.type === "user" &&
                option.name.toLowerCase().includes(filterValue),
        );

        const filteredChannels = allCategorys.filter(
            (option) =>
                option.type === "channel" &&
                option.name.toLowerCase().includes(filterValue),
        );

        return [...filteredUsers, ...filteredChannels];
    }
}
