import { Component, OnInit } from '@angular/core';
import {
  NgSpatialNavigationModule,
  NgSpatialNavigationService
} from "ng-spatial-navigation";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSpatialNavigationModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profiles = [
    {
      name: 'Федя',
      image:
        'https://i.pinimg.com/originals/0c/0d/0d/0c0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d.jpg',
    },
    {
      name: 'Вася',
      image:
        'https://i.pinimg.com/originals/0c/0d/0d/0c0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d.jpg',
    },
    {
      name: 'Петя',
      image:
        'https://i.pinimg.com/originals/0c/0d/0d/0c0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d.jpg',
    },
    {
      name: 'Коля',
      image:
        'https://i.pinimg.com/originals/0c/0d/0d/0c0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d.jpg',
    },
  ];

  constructor(private ngSpatialNavigationService: NgSpatialNavigationService) {
  }

  setProfile(profile: { image: string; name: string }) {
    alert('Выбран профиль: ' + profile.name);
  }

  ngOnInit() {
    this.ngSpatialNavigationService.waitForElement('profile_list');
  }
}
