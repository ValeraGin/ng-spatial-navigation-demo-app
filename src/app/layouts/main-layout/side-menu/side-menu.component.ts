import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { NavItem, DirectionFnResult, BlockNavigation } from "ng-spatial-navigation";
import { NgSpatialNavigationModule } from "ng-spatial-navigation";

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgSpatialNavigationModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent  {

  // Происходит при нажатии на кнопку Вправо на пункте меню
  menuItemRightActionCallback = async (navItem?: NavItem): Promise<DirectionFnResult> => {
    // Если пункт меню активен - значит мы находимся на странице с контентом
    if (navItem && navItem.el.nativeElement.classList.contains('active')) {
      // Разрешаем навигацию дальше, чтобы фокус перешел на контент
      return undefined;
    }

    // Кликаем по меню, чтобы загрузить новую страницу вместо навигации на старый контент
    navItem?.el.nativeElement.click();

    // Блокируем навигацию дальше, чтобы фокус не перешел на старый контент
    return { type: 'block', reason: 'Меню ждет нового содержимого' } as BlockNavigation;
  }

  items = [
    { title: 'Главная', link: '/main', queryParams: { type: 'main' } },
    { title: 'Фильмы', link: '/main', queryParams: { type: 'movies' } },
    { title: 'Сериалы', link: '/main', queryParams: { type: 'tvs' } },
    { title: 'Профиль', link: '/profile', queryParams: {} },
  ];

  fullscreenToggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

}
