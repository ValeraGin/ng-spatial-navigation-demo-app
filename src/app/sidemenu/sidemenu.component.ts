import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { NavItem, BlockNavigation, DirectionFnResult } from "ng-spatial-navigation";

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss'],
})
export class SidemenuComponent {

  constructor(private router: Router) {}

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
