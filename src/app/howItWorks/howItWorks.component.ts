import { Component } from '@angular/core';

@Component({
  selector: 'how-it-works',
  templateUrl: './howItWorks.component.html',
})
export class HowItWorksComponent { 
  collapsed = true;
     toggleCollapsed(): void {
       this.collapsed = !this.collapsed;
     }
}