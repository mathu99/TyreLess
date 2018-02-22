import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { get, set, assign } from 'lodash';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router, private http: Http) { this.http = http }
  collapsed = true;
  sub = null;
  properties = <any>{};
  data = <any>{
    typeRegular: true,
    typeRunFlat: true
  };
  searchableContent = <any>{};
  partners = <any>{};

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
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
    set(this.data, 'typeRunFlat', true);
    set(this.data, 'typeRegular', true)
    set(this.data, 'selectedFilter', 'Price: Low to High');
    this.applyFilters();
  }

  applyFilters = () => {  /* Apply side filters */
    this.properties.filteredResults = get(this.properties, 'results', []).filter((e, i) => {
      let matchesFilter = (this.data.typeRunFlat && this.data.typeRegular) ||
        (this.data.typeRunFlat && e.runFlat) || (this.data.typeRegular && !e.runFlat);  /* Tyre type filter */
      return matchesFilter;
    });
    this.sort(this.data.selectedFilter || 'Price: Low to High');
    this.setRetailers();
  }

  setRetailers = () => {
    let retailers = [];
    set(this, 'data.retailers', []);
    set(this, 'data.retailerChecks', []);
    this.properties.filteredResults.forEach(e => {
      if (retailers.indexOf(e.partner) == -1) {
        retailers.push(e.partner);
      }
    });
    set(this.properties, 'retailers', retailers);
    set(this.properties, 'retailerChecks', new Array(this.properties.retailers.length).fill(true));
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
    }).map(e => { /* Work out total */
      e.totalPrice = '' + parseFloat(e.price) * parseFloat(get(this.data, 'quantity'));
      return e;
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
      console.log(e)
      return e;
    })
  };

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}