import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router, private http: Http) { this.http = http }
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
        this.data = JSON.parse(JSON.stringify(params)); /* Copy object */
        this.data.wheelAlignmentChecked = this.data.wheelAlignmentChecked == "true";
        this.data.wheelBalancingChecked = this.data.wheelBalancingChecked == "true";
        if (this.properties['vehicleTypes'] != undefined) {
          this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
        }
      });
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
      this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
    });
  }

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}