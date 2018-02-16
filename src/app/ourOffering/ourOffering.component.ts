import { Component } from '@angular/core';

@Component({
  selector: 'app-offering',
  templateUrl: './ourOffering.component.html',
})
export class OurOfferingComponent {
    collapsed = true;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
}