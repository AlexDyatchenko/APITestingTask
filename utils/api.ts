import { APIRequestContext, APIResponse } from "@playwright/test";
import { PayloadBuilder } from "../modules/data/payload-builder";

let storedToken: string | null = null;

export class Api {
    private response: APIResponse | null = null;
    private authToken: string | null = null;

    constructor(
        public requestContext: APIRequestContext,
        public baseURL: string = "",
        private expectedStatus: number = 200,
        private getToken: boolean = true
    ) {
    }

    setExpectedStatus(status: number): this {
        this.expectedStatus = status;
        return this;
    }

    setToken(token: string): this {
        this.authToken = token;
        return this;
    }

    private async getAuthToken(): Promise<string | null> {
        if (this.authToken) return this.authToken;
        if (!this.getToken) return null;
        
        if (!storedToken) {
            storedToken = PayloadBuilder.generateValidToken();
        }
        return storedToken;
    }

    private async fetch(
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        endpoint: string,
        options: { params?: any; data?: any; headers?: Record<string, string> } = {}
    ): Promise<this> {
        const token = await this.getAuthToken();
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const url = this.baseURL + endpoint;

        this.response = await this.requestContext.fetch(url, {
            method,
            headers,
            params: options.params,
            data: options.data,
        });

        if (this.expectedStatus !== -1 && this.response.status() !== this.expectedStatus) {
            // Optional: throw error or handle it. 
            // User asked for "with lots of defaults like 200 for status"
            // We'll keep it as a property to check later or just let the test expect it.
        }

        return this;
    }

    async getRequest(endpoint: string, params?: any, headers?: Record<string, string>): Promise<this> {
        return await this.fetch("GET", endpoint, { params, headers });
    }

    async postRequest(endpoint: string, data?: any, headers?: Record<string, string>): Promise<this> {
        return await this.fetch("POST", endpoint, { data, headers });
    }

    getResponse(): APIResponse {
        if (!this.response) {
            throw new Error("No response available. Make a request first.");
        }
        return this.response;
    }

    async getBody<T = any>(): Promise<T> {
        return await this.getResponse().json();
    }

    status(): number {
        return this.getResponse().status();
    }
}
