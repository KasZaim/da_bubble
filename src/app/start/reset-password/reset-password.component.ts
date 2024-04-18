import { Component } from '@angular/core';
import { StartComponent } from '../start.component';
import {MatButtonModule} from '@angular/material/button';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../firestore.service'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ StartComponent, MatButtonModule, FormsModule ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmNewPassword: string = '';
  oobCode: string; // Der Code aus der URL

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router
  ) {
    // Extrahiere den oobCode aus der URL
    this.oobCode = this.route.snapshot.queryParams['oobCode'];
  }

  changePassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }
    this.firestoreService.confirmPasswordReset(this.oobCode, this.newPassword)
      .then(() => {
        alert("Passwort erfolgreich geändert. Bitte melden Sie sich mit Ihrem neuen Passwort an.");
        this.router.navigate(['/login']); // Navigiere zur Login-Seite
      })
      .catch(error => {
        alert("Fehler beim Ändern des Passworts: " + error.message);
      });
  }

  goBack() {
    this.router.navigate(['/login']); // oder eine spezifische Route
  }
}