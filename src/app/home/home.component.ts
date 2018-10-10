import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
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
  @ViewChild('brandModal') private brandModal;
  properties = <any>{};
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
  dropdownSettingsMobile = JSON.parse(JSON.stringify(this.dropdownSettings));

  // Text configuration
  brandTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Clear all',
    allSelected: 'All Brands',
    defaultTitle: 'Unselected',
    defaultLabel: 'Brand',
  };
  sub: any;

  setNavBarVisibility = ($event:any) => {
    set(this.properties, 'navBarVisible', !$event.value);
  }

  openLocationModal = ():void => {
    this.open(this.locationModal);
  }

  openBrandModal = ():void => {
    this.open(this.brandModal);
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
      name: '-',
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

  getBrandDescription = (brands): any => {
    let brandCount = brands.filter(brand => brand.checked).length;
    return  brandCount === 0 ? 'None Selected' :
            brandCount === brands.length ? 'All Brands' :
            brandCount === 1 ? brands.filter(brand => brand.checked)[0].name : `${brandCount} Brands`;
  }

  checkBrand = (brand): void => {
    brand.checked = !brand.checked;
    this.data.brandDescription = this.getBrandDescription(this.properties.brands);
    this.data.brand = this.properties.brands.filter(e => e.checked).map(e => e.name);
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
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        if (params.hasOwnProperty("selected")) {
          this.data = JSON.parse(JSON.stringify(params)); /* Copy object */
          // if (this.data.brand.length === 1) {
          //   this.data.brand= JSON.parse("[" + this.data.brand + "]");
          // }
          // assign(this.data.brand, this.data.brand.map(e => parseInt(e)));
          this.data.wheelAlignmentChecked = this.data.wheelAlignmentChecked == "true";
          this.data.wheelBalancingChecked = this.data.wheelBalancingChecked == "true";
        }
      });
    this.dropdownSettingsMobile.buttonClasses += ' dd-search-text';
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
    Observable.forkJoin(
      this.http.get('environments/config.development.json'),
      this.http.get('/api/tyreConfig'), 
      this.http.get('/api/locationConfig'),
      this.http.get('/api/brandConfig'),
      ).subscribe(results => { 
      let arr: any = results;
      /* Other Config */
      this.properties = results[0].json().properties;
      /* Tyre Config */
      this.properties.tyreWidths = results[1].json().tyreWidths;
      this.properties.tyreProfiles = results[1].json().tyreProfiles;
      this.properties.wheelSizes = results[1].json().wheelSizes;
      /* Location Config */
      this.properties.locations = results[2].json();
      /* Brand Config */
      this.properties.brands = results[3].json().map((e, i) => {
        return {
          id: i,
          name: e.name,
          checked: true,
        }
      });

      if (!this.data) {
          this.data = {
          width: '---',
          profile: '--',
          size: '--',
          brand: this.properties.brands.filter(e => e.checked).map(e => e.name),
          brandDescription: this.getBrandDescription(this.properties.brands),
          location: this.getLocationFromObject(this.properties.locations),
          quantity: this.properties.quantities[0],
          selected: this.properties.vehicleTypes[0].name,
          selectedFilter: this.properties.filters[0],
          wheelAlignmentChecked: true,
          wheelBalancingChecked: true,
        };
      } else {  /* Mobile: coming in with values already */
        let highLevel = get(this.properties,'locations',[]).filter(e => e.name == get(this.data, 'location'))[0];
        if (get(this.data, 'subLocations', []).length == 0){  /* High-level only selection */
          highLevel.checked = true;
          highLevel.sub_locations.map(e => e.checked = true);
        }else {
          highLevel.sub_locations.map(e => e.checked = (get(this.data, 'subLocations', []).indexOf(e.name) > -1));
        }
        if (!Array.isArray(get(this.data, 'brand', []))) {
          set(this.data, 'brand', [get(this.data, 'brand', '')]);
        }
        this.properties.brands.map(e => e.checked = get(this.data, 'brand').filter(b => b === e.name).length > 0);
        set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
        set(this.data, 'brandDescription', this.getBrandDescription(this.properties.brands));
      }
    }, err => {
      /* Handle error */
    });
  }

  update = (property, value) => {
    this.data[property] = value;
  };
}