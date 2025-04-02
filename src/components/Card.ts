import { TCategory } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";

//интерфейс для событий
interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

//интерфейс для карточки
export interface ICard {
  title: string;
  price: number;
  image?: string;
  description?: string;
  category?: TCategory;
  buttonStatus?: boolean;
  index?: number;
}

//это карточка общая
export class BasicCard extends Component<ICard> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement;

  constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions){
    super(container);

    this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
    this._button = container.querySelector(`.${blockName}__button`);
    this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);

    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
          container.addEventListener('click', actions.onClick);
        }
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    if (value === null) {
      this.setText(this._price, 'Бесценно');
    } else {
      this.setText(this._price, `${String(value)} синапсов`);
    }
  }
}

//это уже карточка в каталоге на главной странице
export class CatalogCard extends BasicCard {
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected categoryClasses: { [key in TCategory]: string } = {
    [TCategory.soft]: 'card__category_soft',
    [TCategory.hard]: 'card__category_hard',
    [TCategory.additional]: 'card__category_additional',
    [TCategory.button]: 'card__category_button',
    [TCategory.other]: 'card__category_other'  
  }

  constructor (container: HTMLElement, actions?: ICardActions) {
    super('card', container, actions);

    this._image = ensureElement<HTMLImageElement>(`.${this.blockName}__image`, container);
    this._category = ensureElement<HTMLElement>(`.${this.blockName}__category`, container);
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title)
  }

  set category(value: TCategory) {
    this.setText(this._category, value);
    Array.from(this._category.classList).forEach(className => {
      const regex = /^card__category_/;
      if (regex.test(className)) {
        this._category.classList.remove(className);
      }
    });
    const newClass = this.categoryClasses[value];
    this._category.classList.add(newClass);
  }
}

//Самая полная карточка
export class FullCard extends CatalogCard {
  protected _description: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);

    this._description = ensureElement<HTMLElement>(`.${this.blockName}__text`, container);
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set buttonStatus(value: boolean) {
    if(value) {
      this.setText(this._button, 'Убрать');
    } else {
      this.setText(this._button, 'В корзину');
    }
  }

  set price(value: number | null) {
    if (value === null) {
      //ПРОВЕРКА НА БЕСПЛАТНЫЙ ТОВАР, ЗАПРЕЩАЕТ ЕГО ДОБАВЛЯТЬ В КОРЗИНУ
      this._button.setAttribute('disabled', 'true');
      this.setText(this._price, 'Бесценно');
    } else {
      this.setText(this._price, `${String(value)} синапсов`);
    }
  }
}

export class BasketCard extends BasicCard {
  protected _index: HTMLElement;
  
    constructor(container: HTMLElement, actions?: ICardActions) {
      super('card', container, actions);
      
      this._index = this.container.querySelector('.basket__item-index');
    }

  set index(value: number) {
      this.setText(this._index, value);
    }
}