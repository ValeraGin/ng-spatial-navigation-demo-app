# NgSpatialNavigation

## Описание

Angular Библиотека нужна для удобной навигации по элементам с помощью стрелок на клавиатуре, клавиш (кнопок) OK(Enter),
Back(Backspace).

## Начало работы

### Установка

```bash
npm install ng-spatial-navigation
```

### Использование

Импортируйте модуль `NgSpatialNavigationModule` в ваш `AppModule`:

```typescript
import { NgSpatialNavigationModule } from "ng-spatial-navigation";

@NgModule({
  imports: [NgSpatialNavigationModule],
})
export class AppModule {}
```

Добавьте директивы `navRoot` и `navFocusable` в ваш шаблон:

```html
<div navRoot>
  <div navFocusable>First element</div>
  <div navFocusable>Second element</div>
  <div navFocusable>Third element</div>
</div>
```

Теперь вы можете навигироваться по элементам с помощью стрелок на клавиатуре.

### API

#### navRoot

Директива `navRoot` используется для пометки корневого элемента, в котором будет происходить навигация. Он должен быть
только один в приложении. Допускается наличие корневого элемента внутри другого корневого элемента, но в этом случае
вложенный
корневой элемент будет обычным слоем (`navlayer`), а не корневым.

#### navFocusable

Директива `navFocusable` используется для пометки элементов, которые могут быть фокусируемыми.

- При фокусе добавляется класс `focusable`

* `noNeedScroll` - Если установлен то при смене фокуса не будет вызываться `scrollIntoView`.

[//]: # "- `willFocus` - Функция, которая вызывается перед тем, как фокус будет передан на этот элемент"
[//]: # "- `willBlur`- Функция, которая вызывается перед тем, как фокус будет убран с этого элемента"

По умолчанию не добавляется псевдо класс `:focus`, но если установить `useRealFocus` в `true`, то он будет добавляться.
Библиотека будет вызывать реальный фокус `nativeElement.focus()`, но необходимо чтобы элемент был фокусируемым,
иначе фокус не установится. Например, если элемент `div`, то нужно установить `tabindex="0"`. Если элемент `button`, то
не нужно ничего устанавливать. Если элемент `input`, то нужно установить `tabindex="0"` и `type="text"`. Если
элемент `a`, то нужно установить `tabindex="0"` и `href="javascript:void(0)"`.

#### navList

Директива `navList` нужна для объединения элементов в группу. Она определяет, как происходит навигация между ними -
вертикально или горизонтально.

- `horizontal` - Если установлен, то элементы будут навигироваться по горизонтали (по умолчанию - по вертикали)

#### navGrid

Директива `navGrid` нужна для объединения элементов в грид (таблица).

Обязательные свойства:

- `gridRowSize` - количество элементов в ряду

#### navLayer

Директива `navLayer` нужна для объединения элементов в слой (обычно это модальное окно). Слой не дает перейти на другой
слой и при появлении автоматически перехватывает на себя фокус.

### Общие свойства всех навигационных директив

- `navId` - Идентификатор элемента. Если не установлен, то берется `id` элемента
- `vFocus` - Событие, которое вызывается когда элемент, получает фокус
- `vBlur` - Событие, которое вызывается когда элемент, теряет фокус
- `back` - Перехватывет фокус на себя при возврате назад. Например, в ряду если он будет установлен на первый элемент,
  то при нахождении в середине и нажатии на кнопку назад, фокус будет переведен на этот первый элемент.

## License

MIT © [Ignatkovich Valery](mailto:valeragin@gmail.com)
