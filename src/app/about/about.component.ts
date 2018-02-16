import { Component } from '@angular/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
  })
  export class AboutComponent { 
    collapsed = true;
     toggleCollapsed(): void {
       this.collapsed = !this.collapsed;
     }
  }