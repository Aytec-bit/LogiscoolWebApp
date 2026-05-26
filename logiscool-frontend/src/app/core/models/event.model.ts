export interface EventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string | null;
  targetAge: string | null;
  seat: number;
  date: string;
  lengthTime: string;
  price: number | null;
}

export interface EventFilterOptions {
  locations: string[];
  types: string[];
  targetAges: string[];
}

export interface EventFilters {
  searchText: string;
  location: string;
  type: string;
  targetAge: string;
}
