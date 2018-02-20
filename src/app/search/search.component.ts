import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router) {}
    collapsed = true;
    sub = null;
    properties = {
      searching: false,
      valid: false,
    }
    data = null;

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  ngOnInit() {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        this.data = params;
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}