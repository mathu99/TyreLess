import { Component, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { get, set, assign } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  properties = <any>{};
  data = <any>{
    tyreType: 'regular',
  };
  searchableContent = <any>{};
  partners = <any>{};
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  open(content) {
    this.modalService.open(content).result.then((result) => {

    }, (reason) => {

    });
  }

  viewBreakdown = (): void => {
    this.open(this.content);
  };
  ngOnInit() {
    this.sub = this.route
      .queryParams
      .subscribe(params => {
        assign(this.data, JSON.parse(JSON.stringify(params))); /* Copy object */
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
      this.applyFilters(true);
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
    this.applyFilters(true);
  }

  applyFilters = (initRetailers: boolean) => {  /* Apply side filters */
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
      if (get(this.data, 'brand') != 'Any') {
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

  toggleRetailer = (retailer) => {
    retailer.checked = !retailer.checked;
    this.applyFilters(false);
  };

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}