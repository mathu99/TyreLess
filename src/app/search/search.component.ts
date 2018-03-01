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
} from 'angular-2-dropdown-multiselect';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @ViewChild('content') private content;
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

    }, (reason) => {

    });
  }

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
        this.search();
      });
    this.http.get('environments/config.development.json').subscribe(res => {
      assign(this.properties, res.json().properties)
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
  }

  search = () => {
    set(this.properties, 'loading', true);
    set(this.properties, 'results', null);
    setTimeout(() => {
      set(this.properties, 'loading', false);
      set(this.properties, 'results', this.performSearch());
      set(this.properties, 'filteredResults', (this.properties.results));  /* Copy of full results */
      this.applyFilters(true, true);
    }, 0);
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
    this.applyFilters(true, true);
  }

  applyFilters = (initRetailers: boolean, initPriceFilter: boolean) => {  /* Apply side filters */
    this.properties.filteredResults = get(this.properties, 'results', []).filter((e, i) => {
      let matchesFilter = ((this.data.tyreType == 'regular' && !e.runFlat) || (this.data.tyreType == 'runFlat' && e.runFlat));  /* Tyre type filter */
      return matchesFilter;
    });
    this.sort(this.data.selectedFilter || 'Price: Low to High');
    if (initRetailers) {
      this.setRetailers();
    }
    this.properties.filteredResults = get(this.properties, 'filteredResults', []).filter((e, i) => {  /* Only show checked retailers */
      let retailer = get(this.properties, 'retailers', []).filter(r => r.name === e.partner)[0];
      return retailer.checked;
    });
    if (initPriceFilter) {
      this.applyPriceFilter();
    }
    this.properties.filteredResults = get(this.properties, 'filteredResults', []).filter((e, i) => {  /* Only show checked retailers */
      return parseFloat(e.totalPrice) <= parseFloat(get(this.properties, 'priceFilter.current', '100000000'))
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

  setRetailers = () => {
    let retailers = [];
    set(this, 'data.retailers', []);
    let i = 0;
    this.properties.filteredResults.forEach(e => {
      if (retailers.indexOf(e.partner) == -1) {
        let retailer = {
          'name': e.partner,
          'id': i++,
          'checked': true,
        }
        retailers.push(retailer);
      }
    });
    set(this.properties, 'retailers', retailers);
  }

  performSearch = () => {
    return get(this, 'searchableContent.records', []).filter(e => {
      let matches = e.vehicleType == get(this.data, 'selected')
        && e.wheelSize == get(this.data, 'size')
      // &&  e.tyreProfile == get(this.data, 'tyreProfile')
      // &&  e.tyreWidth == get(this.data, 'tyreWidth')
      // &&  e.location.province == get(this.data, 'location');
      if (get(this.data, 'brand') != 'All') {
        matches = matches && e.brand == get(this.data, 'brand');
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
    })
  };

  checkSelect = (result) => {
    if (result) {
      result.contactMe = !result.contactMe;
    }
    set(this.properties, 'showContactMe', get(this.properties, 'filteredResults', []).some(e => e.contactMe));
  };

  toggleRetailer = (retailer) => {
    retailer.checked = !retailer.checked;
    this.applyFilters(false, true);
  };

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}