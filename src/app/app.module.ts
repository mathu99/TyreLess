import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatSliderModule } from '@angular/material';
import { MultiselectDropdownModule } from './dropdown/dropdown.module';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { InViewportModule } from 'ng-in-viewport';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './howItWorks/howItWorks.component';
import { OurOfferingComponent } from './ourOffering/ourOffering.component';
import { SearchComponent } from './search/search.component';
import { TyreCareComponent } from './tyreCare/tyreCare.component';

import 'intersection-observer';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MatSliderModule,
    MultiselectDropdownModule,
    RouterModule.forRoot(routes),
    InViewportModule.forRoot(),
    NgbModule.forRoot(),
    ScrollToModule.forRoot(),
  ],
  declarations: [
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
