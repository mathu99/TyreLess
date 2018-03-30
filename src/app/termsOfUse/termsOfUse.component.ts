import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'termsOfUse',
    templateUrl: './termsOfUse.component.html',
})
export class TermsOfUseComponent {
    constructor(private route: ActivatedRoute, private router: Router,) {
    }
   
    collapsed = true;
    toggleCollapsed(): void {
        this.collapsed = !this.collapsed;
      }
}