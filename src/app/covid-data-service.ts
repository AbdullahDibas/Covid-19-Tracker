import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CountryCovidData } from './models/CountryCovidData';
import { Observable } from 'rxjs';
import { Country } from './models/Country';
import { WorldTotals } from './models/WorldTotals';
import { CountrySummary } from './models/CountrySummary';

@Injectable({
  providedIn: 'root'
})
export class CovidDataService {

  _getCountryCovidData: string = "";

  constructor(private httpClientModule: HttpClient) { }

  getWHONewsFeed(): Observable<string> {
    this._getCountryCovidData = `https://www.who.int/rss-feeds/news-english.xml`;

    var headers: { [name: string]: string } = {};

    headers['Content-Type'] = 'application/rss+xml';
    headers['Accept'] = '*/*';

    let options = { headers: new HttpHeaders(headers) };

    return this.httpClientModule.get<string>(this._getCountryCovidData, options);
  }

  getWorldTotals(): Observable<WorldTotals> {
    this._getCountryCovidData = `https://api.covid19api.com/world/total`;

    return this.httpClientModule.get<WorldTotals>(this._getCountryCovidData, this.getRequestOptions());
  }

  getCountriesSummaries(): Observable<CountrySummary>{
    this._getCountryCovidData = `https://api.covid19api.com/summary`;

    return this.httpClientModule.get<CountrySummary>(this._getCountryCovidData, this.getRequestOptions());
  }

  getCountries(): Observable<Country[]> {
    this._getCountryCovidData = `https://api.covid19api.com/countries`;

    return this.httpClientModule.get<Country[]>(this._getCountryCovidData, this.getRequestOptions());
  }

  getCountryCovidData(countryName: string, date: string): Observable<CountryCovidData[]> {
    let data: CountryCovidData[] = [];

    this._getCountryCovidData = `https://api.covid19api.com/live/country/${countryName}/status/confirmed/date/${date}`;
    
    this._getCountryCovidData = `https://api.covid19api.com/dayone/country/${countryName}`;

    this._getCountryCovidData = `https://api.covid19api.com/total/country/${countryName}`;

    return this.httpClientModule.get<CountryCovidData[]>(this._getCountryCovidData,  this.getRequestOptions());
  }

  private getRequestOptions() {
    var headers: { [name: string]: string } = {};

    headers['Content-Type'] = 'application/json';

    headers['Accept'] = 'application/json';

    let options = { headers: new HttpHeaders(headers) };

    return options;
  }
}
