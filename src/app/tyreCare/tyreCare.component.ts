import { Component } from '@angular/core';

@Component({
  selector: 'app-tyre-care',
  templateUrl: './tyreCare.component.html',
})
export class TyreCareComponent {
    collapsed = true;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
}