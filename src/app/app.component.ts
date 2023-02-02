import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'ng-spatial-navigation-demo-app';

  items = Array.from({length: 15}).map((_, i) => i + 1);
  navEnabled: any;

  showGrid: boolean = false;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {

  }

  click($event: MouseEvent) {
    ($event.target as HTMLElement).style.backgroundColor = ($event.target as HTMLElement).style.backgroundColor === 'red' ? 'unset' : 'red'
  }

  deleteItem(item: number) {
    delete this.items[this.items.indexOf(item)];
    this.items = this.items.filter(Boolean)
    console.log(this.items)
  }

  addItem(item: number) {
    this.items.splice(this.items.indexOf(item) + 1, 0, item + 100);
  }
}
