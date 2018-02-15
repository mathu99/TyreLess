import { Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './howItWorks/howItWorks.component';
import { OurOfferingComponent } from './ourOffering/ourOffering.component';
import { SearchComponent } from './search/search.component';
import { TyreCareComponent } from './tyreCare/tyreCare.component';

export const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'contactUs', component: ContactUsComponent },
  { path: '', component: HomeComponent },
  { path: 'howItWorks', component: HowItWorksComponent },
  { path: 'ourOffering', component: OurOfferingComponent },
  { path: 'search', component: SearchComponent },
  { path: 'tyreCare', component: TyreCareComponent },
];

/* Details at: https://coryrylan.com/blog/introduction-to-angular-routing */