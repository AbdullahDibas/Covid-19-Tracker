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
  ApexResponsive,
  ApexOptions,
  ApexStroke,
  ApexYAxis
} from "ng-apexcharts";
import { DatePipe } from '@angular/common';
import { Country } from './models/Country';
import { WorldTotals } from './models/WorldTotals';
import { CountrySummary } from './models/CountrySummary';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  colors: string[];
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  colors?: string[];
  stroke: ApexStroke;
  legend: any;
  labels: any;
  options: ApexOptions;
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
  selectedCountryDisplayName = '';
  countries: Country[];
  countriesSummary: CountrySummary;
  countriesConfirmedCases: { [code: string]: number } = {};
  worldTotals: WorldTotals;
  constructor(private _covidDataService: CovidDataService, private _datePipe: DatePipe) {
    this.covidDataSVC = _covidDataService;
    _covidDataService.getCountries().subscribe(res => {
      this.countries = res;
    });
    _covidDataService.getWorldTotals().subscribe(res => {
      this.worldTotals = res;
      this.drawWorldTotalsChart();
    })
  }

  ngOnInit(): void {
    this.getCountryCovidData("jordan");
  }

  ngAfterViewInit() {
    this.getCountriesConfirmedCases();

    //     if (!('fetch' in window)) {
    //       console.log('Fetch API not found, try including the polyfill');
    //     }
    //     else{
    //       fetch('https://news.google.com/rss/search?q=covid-19&hl=en-US&sort=date&gl=US&num=100&ceid=US:en', {
    //         mode: 'no-cors' // 'cors' by default
    //       }).then(function(response) {
    //         console.log(response.text().then(function(valu){console.log(valu);}));
    //   // Do stuff with the response
    // }).catch(function(error) {
    //   console.log('Looks like there was a problem: \n', error);
    // });
    //     }

    // this._covidDataService.getWHONewsFeed().subscribe(res => {
    //   console.log(res);
    // });

    var RSS_URL = `https://www.who.int/rss-feeds/news-english.xml`;
    $.ajax(RSS_URL, {

      accepts: {
        xml: "application/rss+xml"
      },

      dataType: "xml",

      success: function (data) {
        $(data)
          .find("item")
          .each(function () {
            const el = $(this);

            if (el.find("description").text().indexOf("covid") > -1 || el.find("description").text().indexOf("corona") > -1) {
              var imageUrl: string = '';

              if (el.find("description").text().indexOf("<img") > -1) {

                var matches = el.text().match(/src="([^"]+)"/g);

                if (matches && matches[0]) {
                  var imgSource = matches[0].toString().substring(5, matches[0].toString().length - 2);
                  imageUrl = `<img src="${imgSource}" alt="" style="width:100%; height:150px;">`;
                }
              }

              const template = `
          <article style="margin-left:10px; margin-right:10px;">
            ${imageUrl}
              <a style = "color: white; font-size:14px;text-decoration: none;" href="${el
                  .find("link")
                  .text()}" target="_blank" rel="noopener">
                ${el.find("title").text()}
              </a>
              <hr style="border-color:#ffb700;">
          </article>
        `;

              $(".newsFeed").append(template);
            }
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
            scale: ['#EAFAF1', '#6E2C00'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionTipShow: function (e, el, code) {
          el.html(el.html() + ' (Confirmed Cases - ' + this.countriesConfirmedCases[code] + ')');
        }.bind(this),
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
            fill: 'red'
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
      if (!this.countriesConfirmedCases["CN"]) {
          let country: Country = this.countries.filter(c => c.ISO2 == "CN")[0];
          this._covidDataService.getCountryCovidData(country.Slug).subscribe(res => {
          this.countriesConfirmedCases["CN"]  = res[res.length - 1].Confirmed;
          this.showMap();
          this.drawNewWorldTotalsChart();          
        });
      }
      else{ 
         this.showMap();
         this.drawNewWorldTotalsChart();
      }
    });
  }

  onMapCountrySelected(e: any, code: string, isSelected: boolean, selectedRegions: Array<string>) {
    if (isSelected) {

      if (this.countries) {
        let country: Country = this.countries.filter(c => c.ISO2 == code)[0];
        console.log(country);
        this.selectedCountryDisplayName = country.Country;
        this.getCountryCovidData(country.Slug);
      }
    }
  }

  getCountryCovidData(selectedCountry: string) {
    this.selectedCountryName = selectedCountry;

    let covidData: CountryCovidData[] = [];

    this._covidDataService.getCountryCovidData(this.selectedCountryName).subscribe(res => {
      covidData = res;
      this.drawChart(covidData);
    });
  }

  private drawChart(covidData: CountryCovidData[]): void {

    this.chartOptions = {
      series: [
        {
          name: "Active Cases",
          data: covidData.map(c => c.Confirmed - c.Recovered - c.Deaths)
        },
        {
          name: "Recovered Cases",
          data: covidData.map(c => c.Recovered)
        },
        {
          name: "Deaths",
          data: covidData.map(c => c.Deaths)
        }
      ],
      chart: {
        foreColor: "white",
        height: 350,
        width: "100%",        
        type: "line"
      },
      title: {
        text: "COVID-19 Growth - " + this.selectedCountryDisplayName,
        offsetY: 25,
      },
      yaxis: {
        title: {
          text: "Cases Count"
        }
      },
      xaxis: {
        tickAmount: 30,
        type: "datetime",
        categories: covidData.map(c => c.Date)
      }
    };
  }

  private drawWorldTotalsChart() {
    this.worldTotalsChartOptions = {
      series: [this.worldTotals.TotalConfirmed - this.worldTotals.TotalRecovered - this.worldTotals.TotalDeaths, this.worldTotals.TotalRecovered, this.worldTotals.TotalDeaths],
      chart: {
        type: "donut",
        foreColor: "white"
      },
      labels: ["Total Active", "Total Recovered", "Totatl Deaths"],
      stroke: { show: false },
      responsive: [
        {
          options: {
            legend: {
              position: "top"
            }
          }
        }
      ],
      legend: {
        position: 'bottom',
        offsetY: 0
      },
      options: {
        dataLabels: {
          background: {
            foreColor: "green"
          }
        }
      }
    };
  }

  private drawNewWorldTotalsChart() {
    this.worldNewTotalsChartOptions = {
      series: [this.countriesSummary.Global.NewConfirmed - this.countriesSummary.Global.NewRecovered - this.countriesSummary.Global.NewDeaths , this.countriesSummary.Global.NewRecovered, this.countriesSummary.Global.NewDeaths],
      chart: {
        width: "100%",
        type: "donut",
        foreColor: "white"
      },
      labels: ["New Active", "New Recovered", "New Deaths"],
      stroke: { show: false },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: "100%"
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      legend: {
        position: 'bottom',
        offsetY: 0
      },
      options: {
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              background: "green"
            }
          }
        },
        dataLabels: {
          background: {
            enabled: true,
            foreColor: "green"
          },
          style: {
            fontWeight: "bold",
            colors: ["blue", "red", "green"]
          }
        }
      }
    };
  }
}
