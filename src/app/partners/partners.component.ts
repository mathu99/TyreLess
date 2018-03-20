import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { get, set, assign } from 'lodash';

@Component({
    selector: 'partners',
    templateUrl: './partners.component.html',
})
export class PartnersComponent {
    constructor(private route: ActivatedRoute, private router: Router, private http: Http) {
        this.http = http
    }
    properties = <any>{};
    collapsed = true;
    
    toggleCollapsed(): void {
        this.collapsed = !this.collapsed;
      }

    ngOnInit() {
        this.http.get('environments/config.development.json').subscribe(res => {
            assign(this.properties, res.json());
            set(this.properties, 'partnerList', this.getDisplayList(this.properties.partners.records)); 
            set(this.properties, 'tyreBrandList', this.getDisplayList(this.properties.properties.brands)); 
        });
    };

    getDisplayList = (partners) => {
        let displayList = [];
        partners.forEach(e => {
            let firstLetter = get(e, 'name[0]', '').toUpperCase(), 
                displayRecord = displayList.filter(d => d.letter == firstLetter);
            if (displayRecord.length == 0) {
                displayList.push({
                    letter: firstLetter,
                    partners: [{
                        'name': e.name,
                        'email': e.email,
                    }],
                })
            } else {
                get(displayRecord[0], 'partners').push({
                    'name': e.name,
                    'email': e.email,
                })
            }
        });
        displayList.sort((a, b) => {
            let textA = a.letter.toUpperCase();
            let textB = b.letter.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          });
        return displayList;
    };
}