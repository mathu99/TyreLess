import { Component } from '@angular/core';
import { Http } from '@angular/http';
import {
  MultiselectDropdownModule,
  IMultiSelectSettings,
  IMultiSelectTexts,
  IMultiSelectOption
} from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  properties = null;
  data = null;
  collapsed = true;
  // Default selection
  optionsModel: number[] = [1, 2];

  // Settings configuration
  dropdownSettings: IMultiSelectSettings = {
    enableSearch: false,
    showCheckAll: true,
    showUncheckAll: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-secondary dd-inner dd-right',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    containerClasses: 'dd-container',
  };

  // Text configuration
  dropdownTexts: IMultiSelectTexts = {
    checkAll: 'All Tyre Brands',
    allSelected: 'All Tyre Brands',
    defaultTitle: 'Choose Tyre Brand',
  };

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  constructor(private http: Http) {
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
      this.properties.brands = this.properties.brands.map((e, i) => {
        return <IMultiSelectOption> {
          id: i,
          name: e,
        }
      });
        this.data = {
          width: this.properties.tyreWidths[0],
          profile: this.properties.tyreProfiles[0],
          size: this.properties.wheelSizes[0],
          quantity: this.properties.quantities[0],
          brand: this.properties.brands.map(e => e.id),
          location: this.properties.locations[0],
          selected: this.properties.vehicleTypes[0].name,
          selectedFilter: this.properties.filters[0],
          wheelAlignmentChecked: false,
          wheelBalancingChecked: false,
        };
    });
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}