import { Pagination } from "./pagination";

export type MovieShort = {
  name: string;
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
};

export type ListResponse = Pagination<MovieShort>
