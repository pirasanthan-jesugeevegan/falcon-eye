import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Make an HTTP request with proxy support
   */
  async makeRequest<T = any>(
    config: AxiosRequestConfig,
    retries = 2,
  ): Promise<AxiosResponse<T>> {
    const axiosConfig = this.buildAxiosConfig(config);

    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.logger.debug(
          `Making request attempt ${attempt + 1}/${retries + 1} to ${config.url}`,
        );
        return await axios(axiosConfig);
      } catch (error) {
        lastError = error;

        // Don't retry on HTTP status errors (4xx, 5xx)
        if (error.response?.status >= 400 && error.response?.status < 600) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === retries) {
          throw error;
        }

        this.logger.warn(
          `Request failed, retrying in ${Math.pow(2, attempt)}s...`,
          error.message,
        );

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }

    throw lastError;
  }

  /**
   * Build axios configuration with proxy support
   */
  private buildAxiosConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const proxyUrl =
      this.configService.get<string>('HTTP_PROXY') ||
      this.configService.get<string>('HTTPS_PROXY') ||
      this.configService.get<string>('PROXY_URL');

    const axiosConfig: AxiosRequestConfig = {
      ...config,
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': 'QA-Monitor/1.0',
        ...config.headers,
      },
    };

    // Add proxy configuration if available
    if (proxyUrl) {
      this.logger.log(`Using proxy: ${proxyUrl}`);

      // For HTTPS requests, use HttpsProxyAgent
      if (config.url?.startsWith('https://')) {
        try {
          const httpsAgent = new HttpsProxyAgent(proxyUrl);
          axiosConfig.httpsAgent = httpsAgent;
        } catch (error) {
          this.logger.error('Failed to create HTTPS proxy agent', error);
        }
      } else {
        // For HTTP requests, use proxy configuration
        axiosConfig.proxy = {
          host: new URL(proxyUrl).hostname,
          port: parseInt(new URL(proxyUrl).port) || 80,
          protocol: new URL(proxyUrl).protocol.replace(':', ''),
        };
      }
    }

    return axiosConfig;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>({ ...config, method: 'GET', url });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>({ ...config, method: 'DELETE', url });
  }
}
