import { AuthService } from './../../services/auth.service';
import { ApiService } from './../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { UserStoreService } from 'src/app/services/user-store.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditUserModalComponent } from 'src/app/modal/edit-user-modal/edit-user-modal.component';
import { DeleteConfirmModalComponent } from 'src/app/modal/delete-confirm-modal/delete-confirm-modal.component';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public users: any = [];
  public role!: string;
  public fullName: string = "";
  searchControl = new FormControl();
  filteredUsers: any[] = [];
  isLoading = false;


  // For edit modal
  editForm: FormGroup;
  selectedUser: any;
  userIdToDelete: number | null = null;

  constructor(private api: ApiService,
    private auth: AuthService,
    private userStore: UserStoreService,
    private modalService: NgbModal) {

    this.editForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl('USER')
    });
  }

  ngOnInit() {
    console.log("hello from dashboard")
    this.role = this.auth.getRoleFromToken();
    this.loadUsers();

    this.userStore.getFullNameFromStore()
      .subscribe(val => {
        const fullNameFromToken = this.auth.getfullNameFromToken();
        this.fullName = val || fullNameFromToken;
      });
    this.setupSearch();
  }

  loadUsers() {
    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = Array.isArray(res) ? res : (res.users || []);
        this.filteredUsers = [...this.users]; // Initialize filteredUsers
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }


  setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          this.isLoading = true;
          if (!term) {
            return of(this.users); // Return all users if search is empty
          }
          return this.api.searchUsers(term).pipe(
            catchError(() => of([])) // Return empty array on error
          );
        })
      ).subscribe({
        next: (result) => {
          this.filteredUsers = Array.isArray(result) ? result : [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.filteredUsers = [];
          this.isLoading = false;
        }
      });
  }


  // Edit User Functions
  openEditModal(user: User) {
    const modalRef = this.modalService.open(EditUserModalComponent);
    modalRef.componentInstance.user = user;
    modalRef.componentInstance.isAdmin = this.role === 'ADMIN';

    modalRef.result.then((result) => {
      if (result) {
        const updatedUser = { ...user, ...result };
        this.api.updateUser(updatedUser).subscribe({
          next: () => this.loadUsers(),
          error: (err) => console.error('Error updating user:', err)
        });
      }
    }).catch(() => { });
  }

  updateUser() {
    if (this.editForm.valid) {
      const updatedUser = {
        ...this.selectedUser,
        ...this.editForm.value
      };

      this.api.updateUser(updatedUser).subscribe({
        next: () => {
          this.loadUsers(); // Refresh the list
          this.modalService.dismissAll();
        },
        error: (err) => {
          console.error('Error updating user:', err);
        }
      });
    }
  }

  confirmDelete(userId: number) {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);

    modalRef.result.then((result) => {
      if (result) {
        this.api.deleteUser(userId).subscribe({
          next: () => this.loadUsers(),
          error: (err) => console.error('Error deleting user:', err)
        });
      }
    }).catch(() => { });
  }

  deleteUser() {
    if (this.userIdToDelete) {
      console.log("Logging... "+this.userIdToDelete)
      this.api.deleteUser(this.userIdToDelete).subscribe({
        next: () => {
          this.loadUsers(); 
          this.modalService.dismissAll();
          this.userIdToDelete = null;
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  revokeModerator(userId: number) {
    if (confirm('Are you sure you want to revoke moderator privileges for this user?')) {
      this.api.updateUserRole(userId, 'USER').subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error revoking moderator:', err);
        }
      });
    }
  }


  logout() {
    this.auth.signOut();
  }


}
