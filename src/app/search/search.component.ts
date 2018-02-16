import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {collapsed = true;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  } }