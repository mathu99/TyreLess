import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'privacyPolicy',
    templateUrl: './privacyPolicy.component.html',
})
export class PrivacyPolicyComponent {
    constructor(private route: ActivatedRoute, private router: Router,) {
    }
   
    collapsed = true;
    toggleCollapsed(): void {
        this.collapsed = !this.collapsed;
      }
}