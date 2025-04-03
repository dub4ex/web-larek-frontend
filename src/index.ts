import './scss/styles.scss';
import { AppAPI } from './components/AppAPI';
import { AppState, TCatalogChangeEvent } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { BasketCard, CatalogCard, FullCard } from './components/Card';
import { Page } from './components/Page';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IContactsForm, IOrderForm, IProduct, TPayment } from './types';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';
import { Order } from './components/Order';



const events = new EventEmitter();
const api = new AppAPI(CDN_URL, API_URL);

// Модель данных приложения
const appData = new AppState({}, events);

//Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
// Глобальные контейнеры
const  page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Получаем товары с сервера
api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

//Загрузили каталог с сервера
//Отобразили
events.on<TCatalogChangeEvent>('catalog:downloaded', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new CatalogCard(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category
    });
  });
  //При первой загрузке показывает что корзина пустая
  page.counter = appData.basket.length;
})

//Получение данных товара по клику
events.on('card:select', (item: IProduct) => {
  appData.setPreview(item);
})

//Рендер полной карточки
events.on('fullCard:open', (item: IProduct) => {
  const card = new FullCard(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('item:addOrDelete', item)
  });
  modal.render({
    content: card.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category,
      description: item.description,
      buttonStatus: appData.isActive(item),
    })
  });
})

//триггерим полную карточку либо на добавление либо на удаление
events.on('item:addOrDelete', (item: IProduct) => {
  appData.toggleOrderedProduct(item);
  page.counter = appData.basket.length;
})

//открытие корзины
events.on('basket:open', () => {
  basket.setTotalPrice(appData.getTotalPrice());
  basket.items = appData.basket.map((item, i) => {
    const card = new BasketCard(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('item:remove', item)
    });
    i++ ;
    return card.render({
      title: item.title,
      price: item.price,
      index: i,
    })
  })
  modal.render({
    content: basket.render()
  })
})

//удаление товара из корзины
events.on('item:remove', (item: IProduct) => {
  appData.deleteProduct(item);
  page.counter = appData.basket.length;
})

//открытие заказа с оплатой и адресом
events.on('order:open', () => {
  const { payment, address } = appData.order;
  appData.order.total = appData.getTotalPrice();
  modal.render({
    content: order.render({
      valid: order.valid || false,
      errors: order.errors || [],
      payment: payment || '',
      address: address || ''
    })
  })
})

// Изменилось состояние валидации формы
events.on('formOrderErrors:change', (errors: Partial<IOrderForm>) => {
  const { address, payment } = errors;
  order.valid = !address && !payment;
  order.errors = Object.values({ address, payment }).filter(i => !!i).join('; ');
})

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string | TPayment}) => {
  appData.setOrderField(data.field, data.value);
  if (data.field === 'payment') {
    order.updateButtons(data.value)
  }
})

//открытие модалки с личными данными
events.on('order:submit', () => {
  const { email, phone } = appData.order;
  modal.render({
    content: contacts.render({
      email:  email || '',
      phone: phone || '',
      valid: order.valid || false,
      errors: order.errors || []
    })
  })
})

// Изменилось состояние валидации формы
events.on('formContactsErrors:change', (errors: Partial<IContactsForm>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
})

// Изменилось одно из полей
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
  appData.setContactsField(data.field, data.value);
})

//отправка данных на сервер и очистка корзины
events.on('contacts:submit', () => {
  api.postFinalOrder(appData.getOrderToPost())
    .then(data => {
      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => modal.close()
      });
      success.setTotalPrice(data.total);
      modal.render({
        content: success.render()
      })
      appData.clearBasket();
      page.counter = appData.basket.length;
      return data;
    })
    .then(data => {
      console.log(data.id);
      console.log(data.total);
    })
    .catch(err => {
      console.error(err);
    });
})
