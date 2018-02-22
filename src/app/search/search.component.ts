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
      assign(this.properties,  res.json().properties)
      assign(this.searchableContent,  res.json().database);
      this.data.selectedSrc = this.properties['vehicleTypes'].filter(e => e.name === this.data['selected'])[0].imageSrc;
    });
  }

  search = () => {
    set(this.properties, 'loading', true);
    set(this.properties, 'results', null);
    setTimeout(() => {
      set(this.properties, 'loading', false);
      set(this.properties, 'results', this.performSearch());
      this.sort(this.data.selectedFilter || "Price: Low to High");
      console.log(this.properties.results)
    }, 2000);
  };

  sort = (filterName) => {  /* Apply sort filters */
    this.update('selectedFilter', filterName);
    this.properties.results = get(this.properties, 'results', []).sort((a, b) => {
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

  filter = () => {  /* Apply side filters */
    this.properties.results = get(this.properties, 'results', []).filter((e, i) => {
      let matchesFilter = true;
      
      return matchesFilter;
    });
  }

  performSearch = () => {
    return get(this, 'searchableContent.records', []).filter(e => {
      let matches = e.vehicleType == get(this.data, 'selected')
        &&  e.wheelSize == get(this.data, 'size')
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
    });
  };

  update = (property, value) => {
    this.data[property] = value;
  };

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}