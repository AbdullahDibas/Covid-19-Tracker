import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgApexchartsModule }  from 'ng-apexcharts';

import { CovidDataService } from './covid-data-service';
import { DatePipe } from '@angular/common';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,  
    NgApexchartsModule
  ],
  providers: [CovidDataService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
