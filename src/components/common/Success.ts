import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

interface ISuccess {
  setTotalPrice: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected _close: HTMLElement;
  protected _totalPrice: HTMLElement;

  constructor(container: HTMLElement, actions: ISuccessActions) {
      super(container);

      this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
      this._totalPrice = ensureElement<HTMLElement>('.order-success__description', this.container);

      if (actions?.onClick) {
          this._close.addEventListener('click', actions.onClick);
      }
  }

  setTotalPrice(total: number) {
    this._totalPrice.textContent = String(`Списано ${total} синапсов`);
  }
}