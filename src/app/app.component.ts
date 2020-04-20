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
import { CountryNews } from './models/CountryNews';

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

  //#region Declarations
  covidDataSVC: CovidDataService;
  selectedCountry: Country;
  countries: Country[];
  selectedCountryCovidData: CountryCovidData[] = [];
  countriesSummary: CountrySummary;
  countriesConfirmedCases: { [code: string]: number } = {};
  worldTotals: WorldTotals;
  selectedCountryNews: CountryNews;
  isCountryNewsExpanded: boolean = false;
  worldMap: any;
  //#endregion

  constructor(private _covidDataService: CovidDataService) {
    this.selectedCountry = { Slug: "jordan", ISO2: "JO", Country: "Jordan" };

    this.covidDataSVC = _covidDataService;
  }

  ngOnInit(): void {
    this.covidDataSVC.getCountries().subscribe(res => this.countries = res.sort(function (a, b) {
      if (a.Country < b.Country) { return -1; }
      if (a.Country > b.Country) { return 1; }
      return 0;
    }));

    this.covidDataSVC.getWorldTotals().subscribe(res => {

      this.worldTotals = res;

      this.drawWorldTotalsChart();
    });

    this.getCountryCovidData();
  }

  ngAfterViewInit() {
    this.getCountriesConfirmedCases();

    this.initializeWHOLatestNews();
  }

  private initializeWHOLatestNews(): void {
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
                  <a style = "color: white; font-size:14px;text-decoration: none;" href="${el
                  .find("link")
                  .text()}" target="_blank" rel="noopener">
                     ${imageUrl}
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

  openNav(e) {
    this.isCountryNewsExpanded = true;
    e.target.style.visibility = "hidden";
    document.getElementById("countryNewsSideBar").classList.remove("collapsed");
    document.getElementById("countryNewsSideBar").classList.add("expanded");

    (<any>document.getElementsByClassName("closebtn")[0]).style.visibility = "visible";
    document.getElementById("mapDiv").classList.add("collapsed");
    document.getElementById("mapDiv").classList.remove("expanded");
    $('#world-map').empty();
    this.showMap();
    this.drawChart(this.selectedCountryCovidData);
    this.fillCountryNews();
  }

  private fillCountryNews(): void {
    $(".countryNewsFeed").empty();

    if (this.selectedCountryNews && this.selectedCountryNews.news) {
      this.selectedCountryNews.news.forEach(element => {

        var imageUrl = "";
        if (element.images && element.images.length > 0) {
          imageUrl = `<img src="${element.images[0].url}" alt="" style="width:100%; height:150px;">`;
        }

        const template = `
      <article style="margin-left:10px; margin-right:10px;">
          <a style = "color: white; font-size:14px;text-decoration: none;" href="${element.webUrl.trim()}" target="_blank" rel="noopener">
          ${imageUrl}
            ${element.title.trim()}
          </a>
          <hr style="border-color:#ffb700;">
      </article>
    `;

        $(".countryNewsFeed").append(template);
      });
    }
  }

  closeNav() {
    (<any>document.getElementsByClassName("closebtn")[0]).style.visibility = "hidden";
    (<any>document.getElementsByClassName("openbtn")[0]).style.visibility = "visible";
    this.isCountryNewsExpanded = false;
    document.getElementById("countryNewsSideBar").classList.add("collapsed");
    document.getElementById("countryNewsSideBar").classList.remove("expanded");
    document.getElementById("mapDiv").classList.remove("collapsed");
    document.getElementById("mapDiv").classList.add("expanded");
    $('#world-map').empty();
    this.showMap();
    this.drawChart(this.selectedCountryCovidData);
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
          el.html(el.html() + '<br\> Confirmed Count : ' + this.countriesConfirmedCases[code] + ' <br\> Recovery Rate : ' + this.getRecoveryRate(code));
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
        selectedRegions: this.selectedCountry.ISO2,
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

  private getRecoveryRate(countryCode: string): string {
    var country = this.countriesSummary.Countries.filter(c => c.CountryCode == countryCode)[0];

    if (country && country.TotalConfirmed != 0) {
      return (country.TotalRecovered / country.TotalConfirmed * 100).toFixed(2) + ' %';
    }
    else {
      return " - ";
    }
  }

  private getCountriesConfirmedCases(): void {
    this._covidDataService.getCountriesSummaries().subscribe(res => {
      this.countriesSummary = res;
      this.countriesSummary.Countries.forEach(c => this.countriesConfirmedCases[c.CountryCode] = c.TotalConfirmed);
      if (!this.countriesConfirmedCases["CN"]) {
        let country: Country = this.countries.filter(c => c.ISO2 == "CN")[0];
        this._covidDataService.getCountryCovidData(country.Slug).subscribe(res => {
          this.countriesConfirmedCases["CN"] = res[res.length - 1].Confirmed;
          this.showMap();
          this.drawNewWorldTotalsChart();
        });
      }
      else {
        this.showMap();
        this.drawNewWorldTotalsChart();
      }
    });
  }

  onCountrySelected(selectedCountryCode: string) {
    if (selectedCountryCode && selectedCountryCode != "") {
      this.worldMap = $('#world-map').vectorMap('get', 'mapObject');
      this.worldMap.clearSelectedRegions();
      this.worldMap.setSelectedRegions(selectedCountryCode);
      this.worldMap.setFocus({region: selectedCountryCode});
    }
  }

  private onMapCountrySelected(e: any, code: string, isSelected: boolean, selectedRegions: Array<string>) {
    if (isSelected) {

      this.selectedCountryNews = null;

      if (this.countries) {

        this.selectedCountry = this.countries.filter(c => c.ISO2 == code)[0];

        this.getCountryCovidData();

        this._covidDataService.getCountryNews(this.selectedCountry.ISO2).subscribe(res => {

          if (res.news && res.news.length > 0) {

            this.selectedCountryNews = res;

            if (this.isCountryNewsExpanded) {

              this.fillCountryNews();

            }
            else {
              (<any>document.getElementsByClassName("openbtn")[0]).style.visibility = "visible";
            }
          }
          else {
            (<any>document.getElementsByClassName("openbtn")[0]).style.visibility = "hidden";

            if (this.isCountryNewsExpanded) {
              this.closeNav();
            }
          }
        });
      }
    }
  }

  private getCountryCovidData() {

    this._covidDataService.getCountryCovidData(this.selectedCountry.Country).subscribe(res => {
      this.selectedCountryCovidData = res;
      this.drawChart(this.selectedCountryCovidData);
    });
  }

  //#region Charts Draw Methods
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
        type: "line",
        redrawOnParentResize: true
      },
      title: {
        text: "COVID-19 Growth - " + this.selectedCountry.Country,
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
      series: [this.countriesSummary.Global.NewConfirmed - this.countriesSummary.Global.NewRecovered - this.countriesSummary.Global.NewDeaths, this.countriesSummary.Global.NewRecovered, this.countriesSummary.Global.NewDeaths],
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
  //#endregion
}
