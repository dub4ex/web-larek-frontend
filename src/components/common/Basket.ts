import { createElement, ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";

interface IBasketView {
  items: HTMLElement[];
  setTotalPrice: number;
}

export class Basket extends Component<IBasketView> {
  protected _list: HTMLElement;
  protected _totalPrice: HTMLElement;
  protected _button: HTMLElement;

  constructor(container: HTMLElement, protected events: EventEmitter) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._totalPrice = ensureElement<HTMLElement>('.basket__price', this.container);
    this._button = ensureElement<HTMLElement>('.basket__button', this.container);

    this._button.addEventListener('click', () => {
      this.events.emit('order:open');
    })
  }

  setTotalPrice(total: number) {
      this._totalPrice.textContent = String(total + ' синапсов');
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this._list.replaceChildren(...items);
      this._button.removeAttribute('disabled');
    } else {
      this._button.setAttribute('disabled', 'true');
      this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
        textContent: 'Корзина пуста'
      }));
    }
  }
}