import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

export class HTTPClient {
  private httpClient: AxiosInstance;
  private config: AxiosRequestConfig;

  constructor(baseURL: string) {
    this.config = {
      baseURL,
      timeout: 1000,
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    };
    this.httpClient = axios.create(this.config);
  }

  public async get<T = unknown>(
    url: string,
    params?: Record<string, string>
  ): Promise<T> {
    try {
      const response = await this.httpClient.get(url, {
        params,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
