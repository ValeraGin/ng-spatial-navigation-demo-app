import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {

  movie = {
    "title": "The Shawshank Redemption",
    "description": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    "actors": [
      "Tim Robbins",
      "Morgan Freeman",
      "Bob Gunton"
    ],
    "ratings": [
      {
        "source": "IMDb",
        "score": 9.3
      },
      {
        "source": "Rotten Tomatoes",
        "score": 91
      }
    ],
    "screenshots": [
      "https://example.com/shawshank1.jpg",
      "https://example.com/shawshank2.jpg",
      "https://example.com/shawshank3.jpg"
    ]
  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
