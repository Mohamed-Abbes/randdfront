import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-confirm-modal',
  templateUrl: './delete-confirm-modal.component.html'
})
export class DeleteConfirmModalComponent {
  constructor(public activeModal: NgbActiveModal) {}
}