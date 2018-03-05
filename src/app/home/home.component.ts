import { Component, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { assign, set } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  @ViewChild('locationModal') private locationModal;
  properties = null;
  data = null;
  collapsed = true;
  locationModalCollapsed = true;

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

  openPropertyModal = ():void => {
    this.open(this.locationModal);
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.data.locationStr = this.getLocationFromObject(this.properties.locations);
    }, (reason) => {
      this.data.locationStr = this.getLocationFromObject(this.properties.locations);
    });
  }

  getLocationFromObject = (locations):string => {
    let highLevel = locations.filter(e => e.checked);
    if (highLevel.length > 1) {
      return 'Multiple';
    } else if (highLevel.length == 1) {
      return highLevel[0].name;
    } else {
      for (let i = 0; i < locations.length; i++) {
        let lowLevel = locations[i].sub_locations.filter(e => e.checked);
        if (lowLevel.length > 1) {
          return 'Multiple';
        } else if (lowLevel.length == 1) {
          return lowLevel[0].name;
      }
    }
      return 'None';
    }
  }

  topLevelCheck = (location):void => { /* Checking a top-level location (province) - this checks/unchecks all suburbs */
    location.checked = !location.checked;
    location.sub_locations.map(e => e.checked = location.checked);
  };

  lowLevelCheck = (location, sublocation):void => { /* Unheck parent if necessary */
    sublocation.checked = !sublocation.checked;
    location.checked = location.sub_locations.every(e => e.checked);
  };

  constructor(private http: Http, private modalService: NgbModal) {
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
      this.topLevelCheck(this.properties.locations[0]); /* Check all of Gauteng for demo purposes */
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
          locationStr: this.getLocationFromObject(this.properties.locations),
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