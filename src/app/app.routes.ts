import { Routes } from '@angular/router';

import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './howItWorks/howItWorks.component';
import { OurOfferingComponent } from './ourOffering/ourOffering.component';
import { PartnersComponent } from './partners/partners.component';
import { SearchComponent } from './search/search.component';
import { TyreCareComponent } from './tyreCare/tyreCare.component';

export const routes: Routes = [
  { path: 'contactUs', component: ContactUsComponent },
  { path: '', component: HomeComponent },
  { path: 'howItWorks', component: HowItWorksComponent },
  { path: 'ourOffering', component: OurOfferingComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'search', component: SearchComponent },
  { path: 'tyreCare', component: TyreCareComponent },
];

/* Details at: https://coryrylan.com/blog/introduction-to-angular-routing */