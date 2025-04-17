import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
private fullName$ = new BehaviorSubject<string>("");
private role$ = new BehaviorSubject<string>("");
private id$ = new BehaviorSubject<string>("");


constructor() { }

  public getRoleFromStore(){
    return this.role$.asObservable();
  }

  //Persist the data in local storage to protect it from loss after refresh
  public setRoleForStore(role:string){
    this.role$.next(role);
  }

  public getFullNameFromStore(){
    return this.fullName$.asObservable();
  }

  //Persist the data in local storage to protect it from loss after refresh
  public setFullNameForStore(fullname:string){
    this.fullName$.next(fullname)
  }

  public getIdFromStore(){
    return this.id$.asObservable();
  }

  public setIdFromStore(id:string){
    this.id$.next(id)
  }

}
