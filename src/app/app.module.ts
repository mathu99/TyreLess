import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

import { routes } from './app.routes';
import { AboutComponent } from './about/about.component';
import { AppComponent } from './app.component';
import { ContactUsComponent } from './contact/contactUs.component';
import { HomeComponent } from './home/home.component';


@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    NgbModule.forRoot(),
  ],
  declarations: [
    AboutComponent,
    AppComponent,    
    HomeComponent,
    ContactUsComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
