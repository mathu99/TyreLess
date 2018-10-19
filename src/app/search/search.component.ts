import { Component, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { Http } from '@angular/http';
import { get, set, assign } from 'lodash';
import { EmailValidator } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Buffer } from 'buffer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { template, rowEntry } from './html-template';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @ViewChild('content') private content;
  @ViewChild('searchBrandModal') private brandModal;
  @ViewChild('searchLocationModal') private locationModal;
  @ViewChild('contactFormModal') private contactFormModal;
  @ViewChild('mobileContactModal') private mobileContactModal;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router, private http: Http, private modalService: NgbModal) { this.http = http }
  collapsed = true;
  sub = null;
  properties = <any>{
    loading: true,
    showContactMe: false,
    priceFilter: {
      show: true,
      min: '0',
      max: '100000000000'
    },
    label: '',
    mobileSidenav: {
      text: '',
      mode: ''
    }
  };
  data = <any>{
    tyreType: 'regular',
    getContacted: <any> {},
  };
  searchableContent = <any>{};
  partners = <any>{};
  showFiller = true;

  changeDropdown = ($event): void => {
    this.properties.label = ($event.length === this.properties.brands.length) ? 'All Brands' : ($event.length === 1)  ? this.properties.brands[$event[0]].name : 'Multiple Brands';
  }

  priceChange = ($event): void => {
    set(this, 'properties.priceFilter.current', $event.value);
    this.applyFilters('price');
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  openContactMeForm = (): void => {
    this.open(this.mobileContactModal);
  };

  submitContactForm = (): void => {
    this.open(this.contactFormModal);
    /* Send email to partner */
    this.properties.filteredResults.forEach(e => {
      if (e.contactMe === true) {
        let tyreDetails =  `${e.quantitySelected}x ${e.brand} ${e.tyreModel} ${e.tyreWidth}/${e.tyreProfile}/${e.wheelSize}`;
        tyreDetails += (e.runFlat) ? ' (Run Flat)' : '';
        let temp = template,
            total = (parseFloat(e.price) * parseFloat(e.quantitySelected));
        temp = temp.replace('[client_name]', get(this.data, 'getContacted.name')).replace('[client_email]', get(this.data, 'getContacted.email')).replace('[client_mobile]', get(this.data, 'getContacted.mobile'));
        temp = temp.replace('[tyre_model]', tyreDetails).replace('[tyre_price]', (new CurrencyPipe('en-US')).transform(total, 'R', true)).replace('[total]', (new CurrencyPipe('en-US')).transform(e.totalPrice, 'R', true));
        
        let rows = '';
        if (e.wheelAlignmentChecked) {
          rows += rowEntry.replace('[left_col]', '1x Wheel Alignment').replace('[right_col]', (new CurrencyPipe('en-US')).transform(e.partnerDetails.wheelAlignmentPrice, 'R', true));
        }
        if (e.wheelBalancingChecked) {
          let wheelBalancingTotal = (parseFloat(e.partnerDetails.wheelBalancingPrice) * parseFloat(e.quantitySelected));
          rows += rowEntry.replace('[left_col]', e.quantitySelected + 'x ' + 'Wheel Balancing').replace('[right_col]', (new CurrencyPipe('en-US')).transform(wheelBalancingTotal, 'R', true));
        }
        temp = temp.replace('[rows]', rows);

        let req = {
          title: `New Lead | ${tyreDetails}`,
          html: temp,
        }
        this.http.post('/api/contactMe?recipient=' + e.partnerDetails.email, req).subscribe(resp => {
          
        }, err => {
          /* Handle Error */
        });
        this.checkSelect(e);
      }
    });
    this.data.getContacted = <any>{};
  };

  anyService = (services: any): boolean => {
    return services && services.some(e => e.show);
  }

  sideNav = (selectedOption: string): void => {
    set(this.properties, 'mobileSidenav.mode', selectedOption);
    switch(this.properties.mobileSidenav.mode) {
      case 'filter': {
        set(this.properties, 'mobileSidenav.text', 'Filter Results By:');
      }break;
      case 'sort': {
        set(this.properties, 'mobileSidenav.text', 'Sort Results By:');
      }break;
      case 'map': {
        set(this.properties, 'mobileSidenav.text', 'Map View of Deals');
      }break;
    }
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
        set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    }, (reason) => {
        set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
    });
  }

  openLocationModal = (): void => {
    get(this.properties,'locations',[]).forEach(e => {
      e.collapsed = !e.sub_locations.some(s => s.checked == true);
    });
    this.open(this.locationModal);
  }

  openBrandModal = (): void => {
    this.open(this.brandModal);
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
        'quantity': '1',
        'totalCost': get(result, 'partnerDetails.wheelAlignmentPrice', '0'),
      });
      productTotal = productTotal + parseFloat(get(result, 'partnerDetails.wheelAlignmentPrice', '0'));
    }
    if (result.wheelBalancingChecked) {
      let wheelBalancingPrice = parseFloat(get(result, 'partnerDetails.wheelBalancingPrice', '0')) * parseFloat(result.quantitySelected);
      breakdown.push({
        'line1': 'Wheel Balancing',
        'line2': '',
        'quantity': result.quantitySelected,
        'totalCost': wheelBalancingPrice,
      });
      productTotal = productTotal + wheelBalancingPrice;
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
        this.data.wheelAlignmentChecked = this.data.wheelAlignmentChecked == "true";
        this.data.wheelBalancingChecked = this.data.wheelBalancingChecked == "true";

        Observable.forkJoin(
          this.http.get('environments/config.development.json'),
          this.http.get('/api/tyreConfig'), 
          this.http.get('/api/locationConfig'),
          this.http.get('/api/brandConfig'),
          ).subscribe(results => { 
            let arr: any = results;
            /* Other Config */
            assign(this.properties, results[0].json().properties);
            this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
            this.data.whiteSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].whiteSrc;
            /* Tyre Config */
            this.properties.tyreWidths = results[1].json().tyreWidths;
            this.properties.tyreProfiles = results[1].json().tyreProfiles;
            this.properties.wheelSizes = results[1].json().wheelSizes;
            /* Location Config */
            this.properties.locations = results[2].json();
            let highLevel = get(this.properties,'locations',[]).filter(e => e.name == get(this.data, 'location'))[0];
            if (get(this.data, 'subLocations', []).length == 0){  /* High-level only selection */
              highLevel.checked = true;
              highLevel.sub_locations.map(e => e.checked = true);
            }else {
              highLevel.sub_locations.map(e => e.checked = get(this.data, 'subLocations', []).indexOf(e.name) > -1);
            }
            set(this.data, 'location', this.getLocationFromObject(this.properties.locations));
            /* Brand Config */
            this.properties.brands = results[3].json().map((e, i) => {
              return {
                id: i,
                name: e.name,
                checked: get(this.data, 'brand').filter(b => b === e.name).length > 0,
              }
            });
            set(this.data, 'brandDescription', this.getBrandDescription(this.properties.brands));
            this.search();  
          }, err => {
            /* Handle error */
          });
      });
  }

  search = () => {
    set(this, 'properties.retailers', undefined);
    set(this, 'properties.models', undefined);
    set(this.properties, 'loading', true);
    set(this.properties, 'results', null);
    this.performSearch();
  };

  sort = (filterName) => {  /* Apply sort filters */
    this.update('selectedFilter', filterName);
    this.properties.filteredResults = get(this.properties, 'filteredResults', []).sort((a, b) => {
      var partnerA=a.partner.toLowerCase(), partnerB=b.partner.toLowerCase();
      if (partnerA < partnerB) //sort alphabetically (lowest priority)
        return -1;
      if (partnerA > partnerB)
        return 1;
      return 0;
    }).sort((a, b) => {
      return parseFloat(b.extrasScore) - parseFloat(a.extrasScore);   //sort by extra's score (higher priority)
    }).sort((a, b) => {
      switch (filterName) { //sort by price (highest)
        case 'Price: Low to High': {
          return parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
        }
        case 'Price: High to Low': {
          return parseFloat(b.totalPrice) - parseFloat(a.totalPrice);
        }
      }
    })
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
          models.push(obj);
        } else {
          /* Check if that model of the brand is already there */
          if (models.filter(r => r.brand === e.brand)[0].models.filter(m => m.modelName === e.tyreModel).length === 0) {
            models.filter(r => r.brand === e.brand)[0].models.push({
              id: models.filter(r => r.brand === e.brand)[0].models.length,
              modelName: e.tyreModel,
              checked: true,
              visible: this.properties.filteredResults.filter(r => r.tyreModel == e.tyreModel).length > 0,
            });
          }
        }
      });
      models.forEach(e => { /* Alphabetical Sorting */
        set(e, 'visible', e.models.filter(o => o.visible).length > 0);
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
        if (retailers.filter(r => r.name == e.partner).length == 0) {
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
    let url = `/api/tyreSearch?vehicleType=${get(this.data, 'selected')}&width=${get(this.data, 'width')}&profile=${get(this.data, 'profile')}&size=${get(this.data, 'size')}&province=${get(this.data, 'location.highLevel')}`
    url += this.data.brand.map(b => '&brand=' + b).join('');
    if (get(this.data, 'location.lowLevel', []).length > 0) { /* Filter on suburb */
      get(this.data, 'location.lowLevel').forEach(suburb => {
        url += `&suburb=${suburb}`;
      });
    }
    this.http.get(url).subscribe(res => {
      let tyres = res.json();
      this.properties.results = tyres.map(tyre => {
        let object = {
          brand: get(tyre, 'tyreRef.brand'),
          image: 'data:' + get(tyre, 'tyreRef.tyreImage.contentType', '') + ';base64,' + new Buffer(get(tyre, 'tyreRef.tyreImage.data', '')).toString('base64'),
          branch: {
            location: get(tyre, 'partnerRef.branchPin'),
            name: get(tyre, 'partnerRef.branchName'), 
          },
          location: {
            province: get(tyre, 'partnerRef.province'),
            suburb: get(tyre, 'partnerRef.suburb'),
          },
          partner: get(tyre, 'partnerRef.retailerName'),
          partnerDetails: {
            email: get(tyre, 'partnerRef.salesEmail'),
            name: get(tyre, 'partnerRef.retailerName'),
            logo: get(tyre, 'partnerRef.logo'),
            wheelAlignmentPrice: get(tyre, 'services.liveWheelAlignmentPrice'),
            wheelBalancingPrice: get(tyre, 'services.liveWheelBalancingPrice'),
            services: (get(tyre, 'liveInclusion') || []).map(s => {
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
              }).sort((a, b)=>{
                return a['show'] == true && b['show'] == false;
              })
          },
          price: get(tyre, 'livePrice'),
          runFlat: get(tyre, 'tyreRef.runFlat', '') === 'Run Flat',
          tyreModel: get(tyre, 'tyreRef.tyreModel'),
          tyreProfile: get(tyre, 'tyreRef.profile'),
          tyreWidth: get(tyre, 'tyreRef.width'),
          wheelSize: get(tyre, 'tyreRef.size')
        }
        if (this.data.wheelAlignmentChecked) {
          object.partnerDetails.services.push({'name': 'Wheel Alignment', 'show': true });
        }
        if (this.data.wheelBalancingChecked) {
          object.partnerDetails.services.push({'name': 'Wheel Balancing', 'show': true });
        }
        return object;
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
            e.totalPrice = (parseFloat(e.totalPrice) + (e.quantitySelected * parseFloat(get(e, 'partnerDetails.wheelBalancingPrice', '0')))).toString();
          }
          e.extrasScore = e.partnerDetails.services.filter(s => s.show).length || 0; /* Add additional weight to ranking based on services provided by partner */
          return e;
        }).map((e, i) => {
          e.index = i;
          return e;
        });
      set(this.properties, 'filteredResults', (this.properties.results));
      this.applyFilters();
      set(this.properties, 'loading', false);
    }, err => {
      /* TODO: Handle error */
    });
    // return get(this, 'searchableContent.records', []).filter((e, i) => {
    //   let matches = e.vehicleType == get(this.data, 'selected')
    //     && e.wheelSize == get(this.data, 'size')
    //   &&  e.tyreProfile == get(this.data, 'tyreProfile')
    //   &&  e.tyreWidth == get(this.data, 'tyreWidth')
    //   &&  e.location.province == get(this.data, 'location.highLevel');  /* Province filter */
    //   if (get(this.data, 'location.lowLevel', []).length > 0) { /* Suburb filter */
    //     matches = matches && get(this.data, 'location.lowLevel', []).indexOf(e.location.suburb) > -1;
    //   }
    //   if (get(this.data, 'brand') != 'All') {
    //     let brandIndex = get(this.properties, 'brands').filter(b => b.name === e.brand)[0].id;
    //     matches = matches && get(this.data, 'brand').indexOf(brandIndex) > -1;
    //   }
    //   return matches;
    // }).map(e => { /* Add partner details */
    //   e.partnerDetails = JSON.parse(JSON.stringify(get(this.partners, 'records', []).filter(p => p.name === e.partner)[0]));
    //   e.partnerDetails.services = e.partnerDetails.services.map(s => {
    //     let name = s;
    //     if (this.data.wheelAlignmentChecked && name === "Wheel Alignment") {
    //       s = { 'name': name, 'show': true };
    //     } else if (this.data.wheelBalancingChecked && name === "Wheel Balancing") {
    //       s = { 'name': name, 'show': true };
    //     } else if (s !== "Wheel Alignment" && name !== "Wheel Balancing") {
    //       s = { 'name': name, 'show': true };
    //     } else {
    //       s = { 'name': name, 'show': false };
    //     }
    //     return s;
    //   }).sort((a, b)=>{
    //     return a['show'] == true && b['show'] == false;
    //   });
    //   return e;
    // }).map(e => { /* Work out total */
    //   e.contactMe = false;
    //   e.quantitySelected = '' + get(this.data, 'quantity');
    //   e.wheelAlignmentChecked = get(this.data, 'wheelAlignmentChecked');
    //   e.wheelBalancingChecked = get(this.data, 'wheelBalancingChecked');
    //   e.totalPrice = '' + parseFloat(e.price) * parseFloat(get(this.data, 'quantity'));
    //   if (get(this.data, 'wheelAlignmentChecked') === true) {
    //     e.totalPrice = (parseFloat(e.totalPrice) + parseFloat(get(e, 'partnerDetails.wheelAlignmentPrice', '0'))).toString();
    //   }
    //   if (get(this.data, 'wheelBalancingChecked') === true) {
    //     e.totalPrice = (parseFloat(e.totalPrice) + parseFloat(get(e, 'partnerDetails.wheelBalancingPrice', '0'))).toString();
    //   }
    //   e.extrasScore = e.partnerDetails.services.filter(s => s.show).length || 0; /* Add additional weight to ranking based on services provided by partner */
    //   return e;
    // }).map((e, i) => {
    //   e.index = i;
    //   return e;
    // });
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