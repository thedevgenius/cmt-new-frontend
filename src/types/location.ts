export interface City {
    id: number;
    name: string;
    slug: string;
}

export interface LocationDetails {
    lat: number;
    lng: number;
    landmark: string;
    city: City;
}

export interface Suggestion {
    place_id: string;
    main_text: string;
    secondary_text: string;
}