import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  properties = null;
  data = null;
  collapsed = true;

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  constructor(private http: Http) {
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
      this.data = {
        width: this.properties.tyreWidths[0],
        profile: this.properties.tyreProfiles[0],
        size: this.properties.wheelSizes[0],
        quantity: this.properties.quantities[0],
        brand: this.properties.brands[0],
        location: this.properties.locations[0],
        selected: this.properties.vehicleTypes[0].name,
        wheelAlignmentChecked: false,
        wheelBalancingChecked: false,
      };
    });
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}