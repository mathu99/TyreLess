import { Component, ViewChild } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'contact-us',
  templateUrl: './contactUs.component.html',
})
export class ContactUsComponent {
  data = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };
  closeResult: string;
  collapsed:boolean = true;

  @ViewChild('content') private content;
  constructor(private modalService: NgbModal) { }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  submitContact = (): void => {
    this.data = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };
    this.open(this.content);
  };

  open(content) {
    this.modalService.open(content).result.then((result) => {

    }, (reason) => {

    });
  }
}