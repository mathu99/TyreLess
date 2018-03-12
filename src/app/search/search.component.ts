import { Component, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { get, set, assign } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import {
  MultiselectDropdownModule,
  IMultiSelectSettings,
  IMultiSelectTexts,
  IMultiSelectOption
} from '../dropdown';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @ViewChild('content') private content;
  @ViewChild('searchLocationModal') private locationModal;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private http: Http, private modalService: NgbModal) { this.http = http }
  collapsed = true;
  sub = null;
  properties = <any>{
    showContactMe: false,
    priceFilter: {
      show: true,
      min: '0',
      max: '100000000000'
    }
  };
  data = <any>{
    tyreType: 'regular',
  };
  searchableContent = <any>{};
  partners = <any>{};

  // Settings configuration
  dropdownSettings: IMultiSelectSettings = {
    enableSearch: false,
    showCheckAll: false,
    showUncheckAll: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-secondary dd-inner',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    containerClasses: 'dd-container',
    labelOnTop: true,
  };

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

  open(content) {
    this.modalService.open(content).result.then((result) => {
        set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    }, (reason) => {
        set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    });
  }

  openLocationModal = ():void => {
    get(this.properties,'locations',[]).forEach(e => {
      e.collapsed = !e.sub_locations.some(s => s.checked == true);
    });
    this.open(this.locationModal);
  }

  getLocationFromObject = (locations):any => {
    let locationObj = {
      name: 'Unselected',
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
          locationObj.name = lowLevel.length + ' checked';
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

  viewBreakdown = (result): void => {
    set(this.properties, 'details', result);
    set(this.properties, 'details.breakdown', this.populateBreakdown(result))
    this.open(this.content);
  };

  populateBreakdown = (result): any => {
    let breakdown = [],
      productTotal = (parseFloat(result.quantitySelected) * parseFloat(result.price));
    breakdown.push({
      'line1': result.brand,
      'line2': result.tyreModel,
      'quantity': result.quantitySelected,
      'totalCost': productTotal.toString(),
    });
    let total = (parseFloat(result.quantitySelected) * parseFloat(result.price))
    if (result.wheelAlignmentChecked) {
      breakdown.push({
        'line1': 'Wheel Alignment',
        'line2': '',
        'quantity': 'N/A',
        'totalCost': get(result, 'partnerDetails.wheelAlignmentPrice', '0'),
      });
      productTotal = productTotal + parseFloat(get(result, 'partnerDetails.wheelAlignmentPrice', '0'));
    }
    if (result.wheelBalancingChecked) {
      breakdown.push({
        'line1': 'Wheel Balancing',
        'line2': '',
        'quantity': 'N/A',
        'totalCost': get(result, 'partnerDetails.wheelBalancingPrice', '0'),
      });
      productTotal = productTotal + parseFloat(get(result, 'partnerDetails.wheelBalancingPrice', '0'));
    }
    breakdown.push({
      'line1': 'Total',
      'line2': '',
      'quantity': '',
      'totalCost': productTotal.toString(),
    });
    return breakdown;
  };

  ngOnInit() {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        assign(this.data, JSON.parse(JSON.stringify(params))); /* Copy object */
        assign(this.data.brand, this.data.brand.map(e => parseInt(e)));
        this.data.wheelAlignmentChecked = this.data.wheelAlignmentChecked == "true";
        this.data.wheelBalancingChecked = this.data.wheelBalancingChecked == "true";
        if (get(this.properties, 'vehicleTypes') != undefined) {
          this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
        }
        this.http.get('environments/config.development.json').subscribe(res => {
          assign(this.properties, res.json().properties)
          let highLevel = get(this.properties,'locations',[]).filter(e => e.name == get(this.data, 'location'))[0];
          if (get(this.data, 'subLocations', []).length == 0){  /* High-level only selection */
            highLevel.checked = true;
            highLevel.sub_locations.map(e => e.checked = true);
          }else {
            highLevel.sub_locations.map(e => e.checked = get(this.data, 'subLocations', []).indexOf(e.name) > -1);
          }
          set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
          assign(this.searchableContent, res.json().products);
          assign(this.partners, res.json().partners);
          this.properties.brands = this.properties.brands.map((e, i) => {
            return <IMultiSelectOption> {
              id: i,
              name: e,
            }
          });
          this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
        });
        this.search();
      });
  }

  search = () => {
    set(this, 'properties.retailers', undefined);
    set(this, 'properties.models', undefined);
    set(this.properties, 'loading', true);
    set(this.properties, 'results', null);
    setTimeout(() => {
      set(this.properties, 'loading', false);
      set(this.properties, 'results', this.performSearch());
      set(this.properties, 'filteredResults', (this.properties.results));  /* Copy of full results */
      this.applyFilters();
    }, 2000);
  };

  sort = (filterName) => {  /* Apply sort filters */
    this.update('selectedFilter', filterName);
    this.properties.filteredResults = get(this.properties, 'filteredResults', []).sort((a, b) => {
      switch (filterName) {
        case 'Price: Low to High': {
          return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
        }
        case 'Price: High to Low': {
          return parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
        }
      }
    });
  }

  resetFilters = () => {
    set(this.data, 'tyreType', 'regular');
    set(this.data, 'selectedFilter', 'Price: Low to High');
    set(this, 'properties.retailers', undefined);
    set(this, 'properties.models', undefined);
    this.applyFilters();
  }

  applyFilters = (calledFrom?: string) => {  /* Apply side filters */

    this.properties.filteredResults = get(this.properties, 'results', []).filter((e, i) => {
      let matchesFilter = ((this.data.tyreType == 'regular' && !e.runFlat) || (this.data.tyreType == 'runFlat' && e.runFlat));  /* Tyre type filter */
      return matchesFilter;
    });

    this.sort(this.data.selectedFilter || 'Price: Low to High');

    if (calledFrom != 'price') {
      this.applyPriceFilter();
    }

    this.properties.filteredResults = get(this.properties, 'filteredResults', []).filter((e, i) => {  /* Only show results in price range */
      return parseFloat(e.totalPrice) <= parseFloat(get(this.properties, 'priceFilter.current', '100000000'))
    });

    this.setRetailers();
    
    this.properties.filteredResults = get(this.properties, 'filteredResults', []).filter((e, i) => {  /* Only show checked retailers */
      let retailer = get(this.properties, 'retailers', []).filter(r => r.name === e.partner)[0];
      return retailer.checked;
    });

    this.setModels();

    this.properties.filteredResults = get(this.properties, 'filteredResults', []).filter((e, i) => {  
      let brand = get(this.properties, 'models', []).filter(m => m.brand === e.brand)[0];
      return brand.models.filter(m => m.modelName == e.tyreModel)[0].checked;
    });
    this.checkSelect(null);
  }

  applyPriceFilter = () => {
    if (get(this.properties, 'filteredResults') !== undefined && get(this.properties, 'filteredResults').length > 0) {
      let tmpResults = JSON.parse(JSON.stringify(this.properties.filteredResults));
      tmpResults.sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice));
      set(this.properties, 'priceFilter.min', tmpResults[0].totalPrice);
      set(this.properties, 'priceFilter.max', tmpResults[tmpResults.length - 1].totalPrice);
      set(this.properties, 'priceFilter.current', get(this.properties, 'priceFilter.max'));
    }
  }

  setModels = () => {
    if (get(this, 'properties.models') === undefined) {
      let models = [];
      set(this, 'properties.models', []);
      this.properties.results.forEach(e => {
        let obj = {
          brand: e.brand,
          models: [],
        };
        if (models.filter(r => r.brand === e.brand).length == 0) {
          obj.models.push({
            id: 0,
            modelName: e.tyreModel,
            checked: true,
            visible: this.properties.filteredResults.filter(r => r.tyreModel == e.tyreModel).length > 0,
          })
          set(obj, 'visible', obj.models.filter(o => o.visible).length > 0);
          models.push(obj);
        } else {
          models.filter(r => r.brand === e.brand)[0].models.push({
            id: models.filter(r => r.brand === e.brand)[0].models.length,
            modelName: e.tyreModel,
            checked: true,
            visible: true,
          });
        }
      });
      models.forEach(e => { /* Alphabetical Sorting */
        e.models.sort((a, b) => {
          let textA = a.modelName.toUpperCase();
          let textB = b.modelName.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      });
      models.sort((a, b) => {
        let textA = a.brand.toUpperCase();
        let textB = b.brand.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      set(this.properties, 'models', models);
    } else {
      get(this.properties, 'models').forEach(e => {
        e.models.forEach(m => {
          m.visible = this.properties.filteredResults.filter(r => r.brand == e.brand && m.modelName == r.tyreModel).length > 0;
        });
        e.visible = e.models.filter(r => r.visible).length > 0;
      });
    }
  }

  setRetailers = () => {
    let retailers = [];
    let i = 0;
    if (get(this, 'properties.retailers') == undefined) {
      this.properties.results.forEach(e => {
        if (retailers.indexOf(e.partner) == -1) {
          let model = {
            'name': e.partner,
            'id': i++,
            'checked': true,
            'visible': this.properties.filteredResults.filter(r => r.partner == e.partner).length > 0,
          }
          retailers.push(model);
        }
      });
      retailers.sort((a, b) => {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      set(this.properties, 'retailers', retailers);
    } else {
      this.properties.retailers.forEach(e => {
        e.visible = this.properties.filteredResults.filter(r => r.partner == e.name).length > 0;
      });
    }
  }

  performSearch = () => {
    return get(this, 'searchableContent.records', []).filter((e, i) => {
      let matches = e.vehicleType == get(this.data, 'selected')
        && e.wheelSize == get(this.data, 'size')
      // &&  e.tyreProfile == get(this.data, 'tyreProfile')
      // &&  e.tyreWidth == get(this.data, 'tyreWidth')
      &&  e.location.province == get(this.data, 'location.highLevel');  /* Province filter */
      if (get(this.data, 'location.lowLevel', []).length > 0) { /* Suburb filter */
        matches = matches && get(this.data, 'location.lowLevel', []).indexOf(e.location.suburb) > -1;
      }
      if (get(this.data, 'brand') != 'All') {
        let brandIndex = get(this.properties, 'brands').filter(b => b.name === e.brand)[0].id;
        matches = matches && get(this.data, 'brand').indexOf(brandIndex) > -1;
      }
      return matches;
    }).map(e => { /* Add partner details */
      e.partnerDetails = JSON.parse(JSON.stringify(get(this.partners, 'records', []).filter(p => p.name === e.partner)[0]));
      e.partnerDetails.services = e.partnerDetails.services.map(s => {
        let name = s;
        if (this.data.wheelAlignmentChecked && name === "Wheel Alignment") {
          s = { 'name': name, 'show': true };
        } else if (this.data.wheelBalancingChecked && name === "Wheel Balancing") {
          s = { 'name': name, 'show': true };
        } else if (s !== "Wheel Alignment" && name !== "Wheel Balancing") {
          s = { 'name': name, 'show': true };
        } else {
          s = { 'name': name, 'show': false };
        }
        return s;
      });
      return e;
    }).map(e => { /* Work out total */
      e.contactMe = false;
      e.quantitySelected = '' + get(this.data, 'quantity');
      e.wheelAlignmentChecked = get(this.data, 'wheelAlignmentChecked');
      e.wheelBalancingChecked = get(this.data, 'wheelBalancingChecked');
      e.totalPrice = '' + parseFloat(e.price) * parseFloat(get(this.data, 'quantity'));
      if (get(this.data, 'wheelAlignmentChecked') === true) {
        e.totalPrice = (parseFloat(e.totalPrice) + parseFloat(get(e, 'partnerDetails.wheelAlignmentPrice', '0'))).toString();
      }
      if (get(this.data, 'wheelBalancingChecked') === true) {
        e.totalPrice = (parseFloat(e.totalPrice) + parseFloat(get(e, 'partnerDetails.wheelBalancingPrice', '0'))).toString();
      }
      return e;
    }).map((e, i) => {
      e.index = i;
      return e;
    });
  };

  checkSelect = (result) => {
    if (result) {
      result.contactMe = !result.contactMe;
    }
    set(this.properties, 'showContactMe', get(this.properties, 'filteredResults', []).some(e => e.contactMe));
  };

  toggleRetailer = (retailer) => {
    retailer.checked = !retailer.checked;
    this.applyFilters('retailer');
  };

  togglelModel = (model) => {
    model.checked = !model.checked;
    this.applyFilters('model');
  };

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}