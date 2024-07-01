import { Injectable, inject } from "@angular/core";
import {
    Firestore,
    collection,
    doc,
    setDoc,
    onSnapshot,
    getFirestore,
    CollectionReference,
    DocumentData,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import {
    getAuth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    confirmPasswordReset,
} from "firebase/auth";
import { Router } from "@angular/router";
import {
    getRedirectResult,
    signInWithRedirect,
    signOut,
    updateEmail,
} from "@angular/fire/auth";
import { User } from "./interfaces/user";

@Injectable({
    providedIn: "root",
})
export class FirestoreService {
    firestore: Firestore = inject(Firestore);
    auth = getAuth();
    provider = new GoogleAuthProvider();
    currentUser$: Observable<string | null>;
    currentUserID = "";
    usersRef: CollectionReference<DocumentData>;
    channelsRef: CollectionReference<DocumentData>;

    constructor(private router: Router) {
        this.usersRef = collection(this.firestore, "users");
        this.channelsRef = collection(this.firestore, "channels");

        this.currentUser$ = new Observable((observer) => {
            onAuthStateChanged(this.auth, (user) => {
                if (user) {
                    observer.next(user.uid);
                    this.currentUserID = user.uid;
                    this.updateUserStatus(user.uid, true); // User ist online
                    if (
                        this.router.url === "/login" ||
                        this.router.url === "/signup" ||
                        this.router.url === "/recovery" ||
                        this.router.url === "/reset-password"
                    ) {
                        this.handleGoogleRedirectResult();
                        this.router.navigate(["/"]);
                    }
                } else {
                    observer.next(null);
                    this.updateUserStatus(this.currentUserID, false); // User ist offline
                    if (this.router.url === "/") {
                        this.router.navigate(["/login"]);
                    }
                }
            });
        });

        // Event listener für das Schließen des Fensters oder Tabs
        window.addEventListener("beforeunload", this.setOfflineStatus);
        window.addEventListener("unload", this.setOfflineStatus);
    }

    private setOfflineStatus = () => {
        if (this.currentUserID) {
            this.updateUserStatus(this.currentUserID, false);
        }
    };

    private updateUserStatus(userId: string | undefined, status: boolean) {
        if (userId) {
            setDoc(
                doc(this.usersRef, userId),
                { online: status },
                { merge: true },
            );
        }
    }

    getFirestore(): Firestore {
        return this.firestore;
    }

    loginWithGoogle = () => {
        signInWithRedirect(this.auth, this.provider);
    };

    handleGoogleRedirectResult = () => {
        getRedirectResult(this.auth)
            .then(async (result) => {
                if (result) {
                    const user = result.user;

                    await this.saveUser(
                        {
                            avatar: user.photoURL || "",
                            name: user.displayName || "",
                            email: user.email || "",
                        },
                        user.uid,
                    );
                }
                await this.router.navigate(["/"]);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(
                    "Fehler nach der Umleitung: ",
                    errorCode,
                    errorMessage,
                );
            });
    };

    signUpWithEmailAndPassword(
        email: string,
        password: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            createUserWithEmailAndPassword(this.auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    resolve(user.uid);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    loginWithEmailAndPassword = (
        email: string,
        password: string,
    ): Promise<string | null> => {
        return signInWithEmailAndPassword(this.auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("Anmeldung erfolgreich", user.uid);
                this.router.navigate(["/"]);
                return null;
            })
            .catch((error) => {
                return error.code;
            });
    };

    logout() {
        signOut(this.auth)
            .then(() => {
                console.log("User erfolgreich ausgeloggt");
            })
            .catch((error) => {
                console.error("Fehler beim Ausloggen: ", error);
            });
    }

    async saveUser(item: User, uid: string) {
        await setDoc(
            doc(this.usersRef, uid),
            {
                avatar: item.avatar,
                name: item.name,
                email: item.email,
            },
            { merge: true },
        );
    }

    resetPassword(email: string): Promise<void> {
        return sendPasswordResetEmail(this.auth, email)
            .then(() => {
                console.log("Passwort-Reset-E-Mail gesendet.");
            })
            .catch((error) => {
                console.error(
                    "Fehler beim Senden der Passwort-Reset-E-Mail: ",
                    error,
                );
                throw error;
            });
    }

    confirmPasswordReset(code: string, newPassword: string): Promise<void> {
        return confirmPasswordReset(this.auth, code, newPassword);
    }

    async updateEmail(newEmail: string): Promise<void> {
        const user = this.auth.currentUser;
        if (user) {
            try {
                await updateEmail(user, newEmail);
                console.log("Email successfully updated!");
            } catch (error) {
                console.error("Error updating email:", error);
                throw error;
            }
        } else {
            throw new Error("No user logged in!");
        }
    }

    async updateUser(name: string, email: string, avatar: string) {
        const user = {
            avatar: avatar,
            name: name,
            email: email,
        };

        this.saveUser(user, this.currentUserID);
    }

    loginAsGuest() {
        const guestEmail = "guest@guest.guest";
        const guestPassword = "guest1";
        return this.loginWithEmailAndPassword(guestEmail, guestPassword);
    }
}
