import { Component, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { assign, get, set } from 'lodash';
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
    showCheckAll: true,
    showUncheckAll: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-secondary w-100 dd-right p-0',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    containerClasses: 'dd-container',
    labelOnTop: true,
  };
  mobileDropdownSettings: IMultiSelectSettings = {};

  // Text configuration
  brandTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Deselect all',
    allSelected: 'All Manufacturers',
    defaultTitle: 'Unselected',
    defaultLabel: 'Brand',
  };

  setNavBarVisibility = ($event:any) => {
    set(this.properties, 'navBarVisible', !$event.value);
  }

  openLocationModal = ():void => {
    this.open(this.locationModal);
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    }, (reason) => {
      set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    });
  }

  getLocationFromObject = (locations):any => {
    let locationObj = {
      name: 'Province/Suburb',
      highLevel: '',
      lowLevel: [],
    }
    let highLevel = locations.filter(e => e.checked);
    if (highLevel.length > 1) { /* Not allowed currently */
      return 'Multiple';
    } else if (highLevel.length == 1) {
      locationObj.highLevel = highLevel[0].name;
      locationObj.name = highLevel[0].name;
      return locationObj;
    } else {
      for (let i = 0; i < locations.length; i++) {
        let lowLevel = locations[i].sub_locations.filter(e => e.checked);
        locationObj.highLevel = locations[i].name;
        locationObj.lowLevel = lowLevel.map(e => e.name);
        if (lowLevel.length > 1) {
          locationObj.name = lowLevel.length + ' suburbs';
          return locationObj;
        } else if (lowLevel.length == 1) {
          locationObj.name = lowLevel[0].name;
          return locationObj;
      }
    }
      return locationObj;
    }
  }

  topLevelCheck = (location):void => { /* Checking a top-level location (province) - this checks/unchecks all suburbs */
    location.checked = !location.checked;
    if (location.checked) {
      location.collapsed = false;
    }
    location.sub_locations.map(e => e.checked = location.checked);
    get(this.properties, 'locations', []).forEach(e => {
      if (e.name != location.name && location.checked) {  /* Uncheck everything else */
        e.checked = false;
        e.collapsed = true;
        e.sub_locations.map(s => s.checked = false);
      }
    });
  };

  lowLevelCheck = (location, sublocation):void => { /* Unheck parent if necessary */
    sublocation.checked = !sublocation.checked;
    location.checked = location.sub_locations.every(e => e.checked);
    if (location.checked) {
      location.collapsed = false;
    }
    get(this.properties, 'locations', []).forEach(e => {
      if (e.name != location.name) {  /* Uncheck everything else */
        e.checked = false;
        e.collapsed = true;
        e.sub_locations.map(s => s.checked = false);
      }
    });
  };

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        if (params.contactUs === 'true') {
          const config: ScrollToConfigOptions = {
            offset: 750,            
            target: 'contactUs',
          };
          this.scrollToService.scrollTo(config);
        } else {
          const config: ScrollToConfigOptions = {
            target: 'homePage',
          };
          this.scrollToService.scrollTo(config);
        }
      });
    }

  constructor(private route: ActivatedRoute, private router: Router, private scrollToService: ScrollToService, private http: Http, private modalService: NgbModal) {
    this.http.get('environments/config.development.json').subscribe(res => {
      this.properties = res.json().properties;
      // this.topLevelCheck(this.properties.locations[2]); /* Check all of Gauteng for demo purposes */
      this.properties.brands = this.properties.brands.map((e, i) => {
        return <IMultiSelectOption> {
          id: i,
          name: e.name,
        }
      });
        this.data = {
          width: 'mm',//this.properties.tyreWidths[0],
          profile: 'mm',//this.properties.tyreProfiles[0],
          size: 'inch',//this.properties.wheelSizes[0],
          quantity: this.properties.quantities[0],
          brand: this.properties.brands.map(e => e.id),
          location: this.getLocationFromObject(this.properties.locations),
          selected: this.properties.vehicleTypes[0].name,
          selectedFilter: this.properties.filters[0],
          wheelAlignmentChecked: true,
          wheelBalancingChecked: true,
        };
    });
    assign(this.mobileDropdownSettings, this.dropdownSettings);
    set(this.mobileDropdownSettings, 'labelOnTop', true);
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}