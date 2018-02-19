import { Component } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import { debug } from 'util';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contactUs.component.html',
})
export class ContactUsComponent {
  data = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  collapsed = true;
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
  };
}