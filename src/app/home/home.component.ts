import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { assign, set } from 'lodash';
import {
  MultiselectDropdownModule,
  IMultiSelectSettings,
  IMultiSelectTexts,
  IMultiSelectOption
} from '../dropdown/';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  properties = null;
  data = null;
  collapsed = true;

  // Settings configuration
  dropdownSettings: IMultiSelectSettings = {
    enableSearch: false,
    showCheckAll: false,
    showUncheckAll: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-secondary w-100 dd-right',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    containerClasses: 'dd-container',
  };
  mobileDropdownSettings: IMultiSelectSettings = {};

  // Text configuration
  brandTexts: IMultiSelectTexts = {
    checkAll: 'All Tyre Brands',
    allSelected: 'All',
    defaultTitle: 'Unselected',
    defaultLabel: 'Brand',
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
    assign(this.mobileDropdownSettings, this.dropdownSettings);
    set(this.mobileDropdownSettings, 'labelOnTop', true);
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}