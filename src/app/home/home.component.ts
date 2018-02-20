import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  properties = {
    wheelSizes: [
      '16', '17', '18', '19'
    ],
    tyreProfiles: [
      '30', '40', '55'
    ],
    tyreWidths: [
      '195', '245', '255'
    ],
    quantities: [
      '1', '2', '3', '4'
    ],
    brands: [
      'Any', 'Bridgestone', 'Continental', 'Dunlop', 'Goodyear', 'Pirelli', 'Yokohama'
    ],
    locations: [
      'Any', 'Gauteng'
    ],
  };
  data = {
    width: this.properties.tyreWidths[0],
    profile: this.properties.tyreProfiles[0],
    size: this.properties.wheelSizes[0],
    quantity: this.properties.quantities[0],
    brand: this.properties.brands[0],
    location: this.properties.locations[0],
    selected: 'car',
    wheelAlignmentChecked: false,
    wheelBalancingChecked: false,
  };
  collapsed = true;

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  constructor(private http: Http) {
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
    });
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}