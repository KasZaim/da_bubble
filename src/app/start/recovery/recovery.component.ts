import { Component } from "@angular/core";
import { FirestoreService } from "../../firestore.service";
import { Location } from "@angular/common";
import { StartComponent } from "../start.component";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
    selector: "app-recovery",
    standalone: true,
    imports: [StartComponent, MatButtonModule, CommonModule, FormsModule],
    templateUrl: "./recovery.component.html",
    styleUrl: "./recovery.component.scss",
})
export class RecoveryComponent {
    email: string = "";
    emailSent = false;
    constructor(
        public location: Location,
        private firestoreService: FirestoreService,
        private router: Router,
    ) {}

    sendResetEmail() {
        this.firestoreService
            .resetPassword(this.email)
            .then(() => {
                this.emailSent = true;
                setTimeout(() => {
                    this.router.navigate(["/"]);
                }, 3000);
            })
            .catch((error) => {
                alert("Fehler beim Senden der E-Mail: " + error.message);
            });
    }
}
