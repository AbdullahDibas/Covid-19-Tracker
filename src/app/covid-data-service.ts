import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CountryCovidData } from './models/CountryCovidData';
import { Observable } from 'rxjs';
import { Country } from './models/Country';
import { WorldTotals } from './models/WorldTotals';
import { CountrySummary } from './models/CountrySummary';
import { CountryNews } from './models/CountryNews';
import { CountriesTotalsDetails } from './models/CountriesTotalsDetails';

@Injectable({
  providedIn: 'root'
})
export class CovidDataService {

  _getCountryCovidData: string = "";

  constructor(private httpClientModule: HttpClient) { }

  getCountriesDetails(): Observable<CountriesTotalsDetails> {
    this._getCountryCovidData = `https://corona-virus-stats.herokuapp.com/api/v1/cases/countries-search?limit=217&page=1`;

    return this.httpClientModule.get<CountriesTotalsDetails>(this._getCountryCovidData, this.getRequestOptions());
  }

  getWHONewsFeed(): Observable<any> {
    this._getCountryCovidData = `http://news.google.com/news?q=covid-19&hl=en-US&sort=date&gl=US&num=100&output=rss`;

    var headers: { [name: string]: string } = {};

    headers['Content-Type'] = 'application/rss+xml';
    headers['Accept'] = '*/*';

    let options = { headers: new HttpHeaders(headers) };

    const requestOptions: Object = {
      observe: "body",
      responseType: "text"
    };

    return this.httpClientModule.get<any>(this._getCountryCovidData, requestOptions);
  }

  getCountryNews(countryCode: string) : Observable<CountryNews>{
    this._getCountryCovidData = `https://api.smartable.ai/coronavirus/news/${countryCode}`;

    var headers: { [name: string]: string } = {};

    headers['Content-Type'] = 'application/json';

    headers['Accept'] = 'application/json';

   // headers['Subscription-Key'] = '3009d4ccc29e4808af1ccc25c69b4d5d';
    
    headers['Subscription-Key'] = '97e63e0b1c8341f5bc64efd71ca732fd';

    let options = { headers: new HttpHeaders(headers) };

    return this.httpClientModule.get<CountryNews>(this._getCountryCovidData, options);
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

  getCountryCovidData(countryName: string): Observable<CountryCovidData[]> {
    let data: CountryCovidData[] = [];

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
