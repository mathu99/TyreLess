import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  router: Router = null;
  year: number;
  constructor(private _router: Router ) {
    this.router = _router;
    this.year = (new Date()).getFullYear();
  }
}
