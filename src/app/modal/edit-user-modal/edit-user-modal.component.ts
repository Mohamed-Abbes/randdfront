import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html'
})
export class EditUserModalComponent implements OnInit {
  @Input() user: any;
  @Input() isAdmin = false;
  
  editForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('USER')
  });

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.editForm.patchValue(this.user);
  }

  save() {
    if (this.editForm.valid) {
      this.activeModal.close(this.editForm.value);
    }
  }
}