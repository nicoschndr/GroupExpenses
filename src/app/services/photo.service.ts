import { Injectable } from '@angular/core';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {AngularFirestore} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  location = 'receipt/';

  constructor(private afsStorage: AngularFireStorage, private afs: AngularFirestore) { }
  async storeImg(imgData: any){
    try{
      const imgName = this.afs.createId() + '.jpg';
      return new Promise((resolve, reject) => {
        const pictureRef = this.afsStorage.ref(this.location + imgName);
        pictureRef.put(imgData).then(() => {
          pictureRef.getDownloadURL().subscribe((url: any) => {
            resolve(url);
          });
        }).catch((err) => {
          reject(err);
        });
      });
      // return imgName;
    } catch (e) {
    }
  }
  async getImg(imgId: string){
    return new Promise<string>((resolve, reject) => {
      this.afsStorage.storage.ref(this.location).child(imgId).getDownloadURL()
        .then((url) => {
          resolve(url);
        }).catch((err) => {
          reject(err);
      });
    });
  }
}
