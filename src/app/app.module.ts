import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { AboutComponent } from './about/about.component';
import { AppComponent } from './app.component';
import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './howItWorks/howItWorks.component';
import { OurOfferingComponent } from './ourOffering/ourOffering.component';
import { SearchComponent } from './search/search.component';
import { TyreCareComponent } from './tyreCare/tyreCare.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
  ],
  declarations: [
    AboutComponent,
    AppComponent,    
    HomeComponent,
    ContactUsComponent,
    HomeComponent,
    HowItWorksComponent,
    OurOfferingComponent,
    SearchComponent,
    TyreCareComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
