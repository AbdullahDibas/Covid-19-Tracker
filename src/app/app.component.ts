import { Component, OnInit, ViewChild } from '@angular/core';
import { CovidDataService } from './covid-data-service';
import { CountryCovidData } from './models/CountryCovidData';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexResponsive
} from "ng-apexcharts";
import { DatePipe } from '@angular/common';
import { Country } from './models/Country';
import { WorldTotals } from './models/WorldTotals';
import { CountrySummary } from './models/CountrySummary';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

declare var jQuery: any
declare var $: any
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;
  public worldTotalsChartOptions: Partial<PieChartOptions>;
  public worldNewTotalsChartOptions: Partial<PieChartOptions>;
  covidDataSVC: CovidDataService;
  selectedCountryName = '';
  countries: Country[];
  countriesSummary: CountrySummary;
  countriesConfirmedCases: { [code: string]: number } = {};
  worldTotals: WorldTotals;
  constructor(private _covidDataService: CovidDataService, private _datePipe: DatePipe) {
    this.covidDataSVC = _covidDataService;
    _covidDataService.getCountries().subscribe(res => {
      this.countries = res;
      console.log(this.countries);
    });
    _covidDataService.getWorldTotals().subscribe(res => {
      this.worldTotals = res;
      console.log(res);
      this.drawWorldTotalsChart();
    })
  }

  ngOnInit(): void {
    this.getCountryCovidData("jordan");
  }

  ngAfterViewInit() {
    this.getCountriesConfirmedCases();

    this._covidDataService.getWHONewsFeed().subscribe(res => {
     console.log(res);
   });

    // try {

    //   const fetch = require('node-fetch');

    //   const RSS_URL = `https://www.who.int/rss-feeds/news-english.xml`;

    //   fetch(RSS_URL)
    //     .then(response => {
    //       response.text();
    //     })
    //     .then(str => {
    //       new window.DOMParser().parseFromString(str, "text/xml");
    //     })
    //     .then(data => {
    //       console.log(data);
    //     })
    // }
    // catch (e) {
    //   console.log(e);

    // }

    const RSS_URL = `https://www.who.int/rss-feeds/news-english.xml`;

$.ajax(RSS_URL, {
  accepts: {
    xml: "application/rss+xml"
  },

  dataType: "xml",

  success: function(data) {
    $(data)
      .find("item")
      .each(function() {
        const el = $(this);

        const template = `
          <article style="margin-left:10px; margin-right:10px;">
            <img src="${el.find("link").text()}/image/large.png" alt="">
              <a style = "color: white; font-size:12px;" href="${el
                .find("link")
                .text()}" target="_blank" rel="noopener">
                ${el.find("title").text()}
              </a>
              <hr style="background-color:gold;">
          </article>
        `;

        $(".newsFeed").append(template);
      });
  }
});

  }

  private showMap() {
    $('#world-map').vectorMap(
      {
        map: 'world_merc',
        series: {
          regions: [{
            values: this.countriesConfirmedCases,
            // scale: ['#C8EEFF', '#0071A4'],
            scale: ['#EAFAF1', '#6E2C00'],
            normalizeFunction: 'polynomial'
          }]
        },
        // onRegionTipShow: function(e, el, code){
        //   el.html(el.html()+' (GDP - '+gdpData[code]+')');
        // },
        backgroundColor: 'black',
        regionsSelectable: true,
        regionsSelectableOne: true,
        onRegionSelected: this.onMapCountrySelected.bind(this),
        regionStyle: {
          initial: {
            fill: 'white',
            "fill-opacity": 1,
            stroke: 'none',
            "stroke-width": 0,
            "stroke-opacity": 1
          },
          hover: {
            "fill-opacity": 0.8,
            cursor: 'pointer'
          },
          selected: {
            fill: 'yellow'
          },
          selectedHover: {
          }
        },
        selectedRegions: "JO",
        regionLabelStyle: {
          initial: {
            'font-family': 'Verdana',
            'font-size': '12',
            'font-weight': 'bold',
            cursor: 'default',
            fill: 'black'
          },
          hover: {
            cursor: 'pointer'
          }
        }
      });
  }

  private getCountriesConfirmedCases(): void {
    this._covidDataService.getCountriesSummaries().subscribe(res => {
      this.countriesSummary = res;
      this.countriesSummary.Countries.forEach(c => this.countriesConfirmedCases[c.CountryCode] = c.TotalConfirmed);
      this.showMap();
      this.drawNewWorldTotalsChart();
    });
  }

  onMapCountrySelected(e: any, code: string, isSelected: boolean, selectedRegions: Array<string>) {
    if (isSelected) {
      console.log("a region is selected" + code);

      if (this.countries) {
        let country: Country = this.countries.filter(c => c.ISO2 == code)[0];

        this.getCountryCovidData(country.Slug);
      }
    }
  }

  getCountryCovidData(selectedCountry: string) {
    this.selectedCountryName = selectedCountry;

    console.log(selectedCountry);

    let covidData: CountryCovidData[] = [];

    this._covidDataService.getCountryCovidData(this.selectedCountryName, "2020-04-01T13:13:30Z").subscribe(res => {
      covidData = res;
      console.log(covidData);
      this.drawChart(selectedCountry, covidData);
    });
  }

  private drawChart(countryName: string, covidData: CountryCovidData[]): void {
    let count: number = 0;

    var array = covidData.map(c => c.Date/*this._datePipe.transform(c.Date, 'MMM d')*/);

    this.chartOptions = {
      series: [
        {
          name: "Confirmed Cases",
          data: covidData.map(c => c.Confirmed)//[10, 41, 35, 51, 49, 62, 69, 91, 148]          
        },
        {
          name: "Recovered Cases",
          data: covidData.map(c => c.Recovered)//[10, 41, 35, 51, 49, 62, 69, 91, 148]
        },
        {
          name: "Deaths",
          data: covidData.map(c => c.Deaths)//[10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        foreColor: "white",
        height: 350,
        width: "100%",
        //"line" | "area" | "bar" | "histogram" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "radar" | "polarArea" | "rangeBar";
        type: "line"
      }/*,
      title: {
        text: "My First Angular Chart"
      }*/,
      xaxis: {
        tickAmount: 30,
        type: "datetime",
        categories: array //["Jan", "Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug", "Sep"]
      }
    };
  }

  private drawWorldTotalsChart() {
    this.worldTotalsChartOptions = {
      series: [this.worldTotals.TotalConfirmed, this.worldTotals.TotalRecovered, this.worldTotals.TotalDeaths],//[13, 55, 13, 43, 22],
      chart: {
        width: 380,
        type: "donut"
      },
      labels: ["Total Confirmed", "Total Recovered", "Totatl Deaths"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  private drawNewWorldTotalsChart() {
    this.worldNewTotalsChartOptions = {
      series: [this.countriesSummary.Global.NewConfirmed, this.countriesSummary.Global.NewRecovered, this.countriesSummary.Global.NewDeaths],//[13, 55, 13, 43, 22],
      chart: {
        width: 380,
        type: "donut"
      },
      labels: ["New Confirmed", "New Recovered", "New Deaths"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }
}
