import { Component } from '@angular/core';
import { BlockNavigation, DirectionFnResult, NavItem, } from 'ng-spatial-navigation';
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {

  appName = environment.appName;

  menu = [
    {title: 'Главная', link: '/', queryParams: {type: 'main'}},
    {title: 'Фильмы', link: '/', queryParams: {type: 'films'}},
    {title: 'Сериалы', link: '/', queryParams: {type: 'shows'}},
    {title: 'Профиль', link: '/profile', queryParams: {}},
  ];

  // Происходит при нажатии на кнопку Вправо на пункте меню
  menuItemRightActionCallback = async (
    navItem?: NavItem
  ): Promise<DirectionFnResult> => {
    // Если пункт меню активен - значит мы находимся на странице с контентом
    if (navItem && navItem.el.nativeElement.classList.contains('active')) {
      // Разрешаем навигацию дальше, чтобы фокус перешел на контент
      return undefined;
    }

    // Кликаем по меню, чтобы загрузить новую страницу вместо навигации на старый контент
    navItem?.el.nativeElement.click();

    // Блокируем навигацию дальше, чтобы фокус не перешел на старый контент
    return {
      type: 'block',
      reason: 'Меню ждет нового содержимого',
    } as BlockNavigation;
  };

  fullscreenToggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch();
    } else {
      document.documentElement.requestFullscreen().catch();
    }
  }
}
