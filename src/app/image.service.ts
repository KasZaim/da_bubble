import { inject, Injectable, OnInit } from "@angular/core";
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
    providedIn: "root",
})
export class ImageService  {
    public storage = inject(Storage);

//     uploadFile(input: HTMLInputElement) {
//       if (!input.files) return 
  
//       const files: FileList = input.files;
  
//       for (let i = 0; i < files.length; i++) {
//           const file = files.item(i);
//           if (file) {
//               const storageRef = ref(this.storage, file.name);
//               uploadBytesResumable(storageRef, file);
//           }
//       }
//   }
  uploadFile(input: HTMLInputElement): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!input.files || input.files.length === 0) {
        resolve(''); // Rückgabe eines leeren Strings, wenn keine Dateien vorhanden sind
        return;
      }
  
      const file = input.files[0];
      const storageRef = ref(this.storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Optional: Handle progress
        },
        (error) => {
          // Handle unsuccessful uploads
          reject(error);
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
            console.log(downloadURL)
          });
        }
      );
    });
  }

  

}
