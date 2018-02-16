import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contactUs.component.html',
})
export class ContactUsComponent {
  collapsed = true;
     toggleCollapsed(): void {
       this.collapsed = !this.collapsed;
     }
}