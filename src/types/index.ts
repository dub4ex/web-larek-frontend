//интерфейс объекта что получаю с сервера
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: TCategory;
  price: number
}

//виды категорий что присваиваются товарам
export const enum TCategory {
  soft = 'софт-скил',
  hard = 'хард-скил',
  button = 'кнопка',
  additional = 'дополнительное',
  other = 'другое'
}

//интерфейс модели
export interface IAppState {
  catalog: IProduct[];
  preview: IProduct | null;
  basket: IProduct[];
  order: IOrder | null
}

//интерфейс формы с контактами
export interface IContactsForm {
  email: string;
  phone: string;
}

//делает объектный тип, где все необязательные ключи это ключи IContactsForm, а значения string
export type TFormContactsErrors = Partial<Record<keyof IContactsForm, string>>;

//интерфейс формы выбора оплаты и адреса
export interface IOrderForm {
  address: string;
  payment: TPayment | string
}

//тип выбора оплаты
export type TPayment = 'card' | 'cash';

//делает объектный тип, где все необязательные ключи это ключи IOrderForm, а значения string
export type TFormOrderErrors = Partial<Record<keyof IOrderForm, string>>;

//интерфейс объекта что получаю после отправки заказа на сервер
export interface IOrderResponse {
  id: string;
  total: number
}

//тип заказа в модели данных
export type IDataOrder = Omit<IOrder, 'items'>

//интерфейс заказа что я должен буду отправить на сервер
export interface IOrder {
  payment: string;
  address: string;
  email: string;
  phone: string;
  total: number;
  items: string[]
}