import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatSliderModule, MatSidenavModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { InViewportModule } from 'ng-in-viewport';

import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';
import { HowItWorksComponent } from './howItWorks/howItWorks.component';
import { PartnersComponent } from './partners/partners.component';
import { PrivacyPolicyComponent } from './privacyPolicy/privacyPolicy.component';
import { OurOfferingComponent } from './ourOffering/ourOffering.component';
import { SearchComponent } from './search/search.component';
import { TermsOfUseComponent } from './termsOfUse/termsOfUse.component';
import { TyreCareComponent } from './tyreCare/tyreCare.component';

import 'intersection-observer';
import 'hammerjs';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MatSliderModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
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
    PartnersComponent,
    PrivacyPolicyComponent,
    SearchComponent,
    TermsOfUseComponent,
    TyreCareComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
