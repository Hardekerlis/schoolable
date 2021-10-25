export interface Location {
  range: number[];
  country: string; // 2 letter ISO-3166-1 country code
  region: string; // Up to 3 alphanumeric variable length characters as ISO 3166-2 code
  // For US states this is the 2 letter state
  // For the United Kingdom this could be ENG as a country like “England
  // FIPS 10-4 subcountry code
  eu: string; // is 0 for countries outside of EU and 1 for countries inside
  timezone: string; // Timezone from IANA Time Zone Database
  city: string; // This is the full city name
  ll: number[]; // The latitude and longitude of the city
  metro: number; // Metro code
  area: number; // The approximate accuracy radius (km), around the latitude and longitude
}
