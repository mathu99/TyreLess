import { Component } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'app';
  properties = {
    tyreWidths: [
      '12','13','14','15','16','17','18','19'
    ],
    tyreProfiles: [
      '30','40','50','60','70'
    ],
    tyreSizes: [
      '250','260','270','280','290','300'
    ],
    quantities: [
      '1','2','3','4'
    ],
    brands: [
      'Dunlop','Goodyear','Michelin','Pirelli','Firestone','Hankook','Toyo'
    ],
    locations: [
      'Cape Town','Durban','JHB','Pretoria'
    ],
  };
  data = {
    width: this.properties.tyreWidths[0],
    profile: this.properties.tyreProfiles[0],
    size: this.properties.tyreSizes[0],
    quantity: this.properties.quantities[0],
    brand: this.properties.brands[0],
    location: this.properties.locations[0],
    selected: 'car',
  };

  update = (property, value) => {
    this.data[property] = value;
  };
}
