import { IOrderForm } from "../types";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
  protected _card: HTMLButtonElement;
  protected _cash: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._card = ensureElement<HTMLButtonElement>('[name=card]', this.container);
    this._cash = ensureElement<HTMLButtonElement>('[name=cash]', this.container);

    this._card.addEventListener('click', () => {
      this._card.classList.add('button_alt_active');
      this._cash.classList.add('button_alt');
      this._card.classList.remove('button_alt');
      this._cash.classList.remove('button_alt_active');
      this.events.emit('order.button:change', { field: 'payment', value: 'card'});
    });

    this._cash.addEventListener('click', () => {
      this._card.classList.add('button_alt');
      this._cash.classList.add('button_alt_active');
      this._card.classList.remove('button_alt_active');
      this._cash.classList.remove('button_alt');
      this.events.emit('order.button:change', { field: 'payment', value: 'cash'});
    });
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }
}