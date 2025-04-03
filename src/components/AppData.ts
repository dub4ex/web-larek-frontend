import { IAppState, IContactsForm, IDataOrder, IOrder, IOrderForm, IProduct, TFormContactsErrors, TFormOrderErrors, TPayment } from "../types";
import { Model } from "./base/Model";

export type TCatalogChangeEvent = {
  catalog: IProduct[];
}

export class AppState extends Model<IAppState> {
  catalog: IProduct[];
  preview: IProduct | null;
  protected _basket: IProduct[] = [];
  order: IDataOrder = {
    payment: '',
    address: '',
    email: '',
    phone: '',
    total: 0
  };
  formOrderErrors: TFormOrderErrors = {};
  formContactsErrors: TFormContactsErrors = {};

  setCatalog(items: IProduct[]) {
    this.catalog = items;
    this.emitChanges('catalog:downloaded', { catalog: this.catalog });
  }

  setPreview(item: IProduct) {
    this.preview = item;
    this.emitChanges('fullCard:open', item);
  }

  isActive(product: IProduct): boolean {
    return this._basket.some(item => item.id === product.id);
  }

  toggleOrderedProduct(product: IProduct) {
    const index = this._basket.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this._basket.splice(index, 1);
    } else {
      this._basket.push(product);
    }
    this.emitChanges('fullCard:open', product);
  }

  deleteProduct(item: IProduct) {
    const index = this._basket.indexOf(item);
    if (index >= 0) {
      this._basket.splice(index, 1);
    }
    this.emitChanges('basket:open', item);
  }

  setOrderField(field: keyof IOrderForm, value: string | TPayment) {
    this.order[field] = value;

    if (this.validateOrder()) {
        this.events.emit('order:ready', this.order);
    }
  }

  validateOrder() {
    const errors: typeof this.formOrderErrors = {};
    if (!this.order.address) {
        errors.address = 'Необходимо указать адрес';
    }
    if (!this.order.payment) {
      errors.payment = 'Необходимо выбрать способ оплаты';
    }
    this.formOrderErrors = errors;
    this.events.emit('formOrderErrors:change', this.formOrderErrors);
    return Object.keys(errors).length === 0;
  }

  setContactsField(field: keyof IContactsForm, value: string) {
    this.order[field] = value;

    if (this.validateContacts()) {
      this.events.emit('contacts:ready', this.order);
    }
  }

  validateContacts() {
    const errors: typeof this.formContactsErrors = {};
    if (!this.order.email) {
        errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
        errors.phone = 'Необходимо указать телефон';
    }
    this.formContactsErrors = errors;
    this.events.emit('formContactsErrors:change', this.formContactsErrors);
    return Object.keys(errors).length === 0;
  }

  getTotalPrice() {
    return this._basket.reduce((acc, curr) => acc + curr.price, 0);
  }

  clearBasket() {
    this._basket = [];
    this.order = {
      payment: '',
      address: '',
      email: '',
      phone: '',
      total: 0
    }
  }

  getIdArray(): string[] {
    return this._basket.map(item => item.id);
  }

  getOrderToPost(): IOrder {
    const itemsOrder = {
      items: this.getIdArray()
    }
    const orderObject = Object.assign(this.order, itemsOrder)
    return orderObject;
  }

  get basket(): IProduct[] {
    return this._basket
  }
}
