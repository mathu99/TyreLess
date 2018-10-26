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

  navigateToExternalLink = (link: string): void => {
    (<any>window).ga('send', 'event', {
      eventCategory: 'Follow Us',
      eventLabel: `Navigate to ${link}`,
      eventAction: `Navigate to ${link}`,
    });
  }

  submitContact = (): void => {
    this.data = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };
    (<any>window).ga('send', 'event', {
      eventCategory: 'Contact Us',
      eventLabel: 'Submit Form',
      eventAction: 'Submit Form',
    });
    this.open(this.content);
  };

  open(content) {
    this.modalService.open(content).result.then((result) => {

    }, (reason) => {

    });
  }
}