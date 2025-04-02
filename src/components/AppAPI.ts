import { IOrder, IOrderResponse, IProduct } from "../types";
import { Api, ApiListResponse } from "./base/api";

export interface IAppAPI {
  getProductList: () => Promise<IProduct[]>;
  postFinalOrder: (item: IOrder) => Promise<IOrderResponse>
}

export class AppAPI extends Api implements IAppAPI {
  readonly cdn: string;
  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) =>
      data.items.map((item) => ({
          ...item,
          image: this.cdn + item.image
      }))
    );
  }

  postFinalOrder(item: IOrder): Promise<IOrderResponse> {
    return this.post('/order', item).then(
      (data: IOrderResponse) => data
    );
  }
}
