export interface CountryNews {
    location:        Location;
    updatedDateTime: Date;
    news:            News[];
}

export interface Location {
    long:            number;
    countryOrRegion: CountryOrRegion;
    provinceOrState: null;
    county:          null;
    isoCode:         CountryOrRegion;
    lat:             number;
}

export enum CountryOrRegion {
    Fr = "FR",
    France = "France",
}

export interface News {
    path:              string;
    title:             string;
    excerpt:           string;
    heat:              number | null;
    tags:              CountryOrRegion[];
    type:              Type;
    webUrl:            string;
    ampWebUrl:         null | string;
    cdnAmpWebUrl:      null | string;
    publishedDateTime: Date;
    updatedDateTime:   null;
    provider:          Provider;
    images:            Image[] | null;
    locale:            Locale;
    categories:        Category[];
    topics:            Topic[];
}

export enum Category {
    News = "news",
}

export interface Image {
    url:         string;
    width:       number;
    height:      number;
    title:       string;
    attribution: null;
}

export enum Locale {
    EnUs = "en-us",
}

export interface Provider {
    name:       string;
    domain:     string;
    images:     null;
    publishers: null;
    authors:    null;
}

export enum Topic {
    Coronavirus = "Coronavirus",
    CoronavirusInEurope = "Coronavirus in Europe",
    NewCases = "New Cases",
}

export enum Type {
    Article = "article",
}