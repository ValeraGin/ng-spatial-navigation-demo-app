import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgSpatialNavigationModule } from "ng-spatial-navigation";
import { SideMenuComponent } from "./side-menu/side-menu.component";

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSpatialNavigationModule, SideMenuComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}
