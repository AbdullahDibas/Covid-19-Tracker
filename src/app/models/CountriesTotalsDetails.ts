export interface PaginationMeta {
    currentPage: number;
    currentPageSize: number;
    totalPages: number;
    totalRecords: number;
}

export interface Row {
    country: string;
    country_abbreviation: string;
    total_cases: string;
    new_cases: string;
    total_deaths: string;
    new_deaths: string;
    total_recovered: string;
    active_cases: string;
    serious_critical: string;
    cases_per_mill_pop: string;
    flag: string;
}

export interface Data {
    paginationMeta: PaginationMeta;
    last_update: string;
    rows: Row[];
}

export interface CountriesTotalsDetails {
    data: Data;
    status: string;
}

    export interface CountryInfo {
        _id: number;
        iso2: string;
        iso3: string;
        lat: number;
        long: number;
        flag: string;
    }

    export interface CountriesTotalsDetailss {
        updated: any;
        country: string;
        countryInfo: CountryInfo;
        cases: number;
        todayCases: number;
        deaths: number;
        todayDeaths: number;
        recovered: number;
        active: number;
        critical: number;
        casesPerOneMillion: number;
        deathsPerOneMillion: number;
        tests: number;
        testsPerOneMillion: number;
        continent: string;
    }
