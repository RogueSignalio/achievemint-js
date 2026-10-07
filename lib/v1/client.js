import axios from 'axios';
import { AuthenticationError, ApiError } from '../errors.js';

export class Client {
  constructor(clientId, clientSecret, url='https://achievemint.net:8443', authPath='/oauth/token') {
    this.apiUrl = url;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authPath = authPath;
    this.pathVersion ='/api/v1';

    this.authPromise = this.authenticate();
  }

  async sendRequest(path, params, responseObj) {
    await this.refreshToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `${this.tokenType} ${this.token}`
    };
    try {
      const response = await axios.post(`${this.apiUrl}${this.pathVersion}${path}`, params, { headers });
      const responseData = response.data;
      if(204 == response.status) {
        return [];
      }
      if(responseData[responseObj]) {
        return responseData[responseObj];
      } else {
        return responseData;
      }
    } catch(error) {
      if(['ECONNREFUSED', 'ENOTFOUND'].includes(error.code)) {
        throw new ApiError(`Invalid API Path: ${this.pathVersion}${path}`, { status: error.errno, code: error.code, cause: error});
      }
      const error_status = error.response.status
      if([400, 404, 403].includes(error_status)) {
        throw new ApiError(`Invalid API Path: ${this.pathVersion}${path}`, { status: error_status, code: error.code, cause: error});
      }

      if(error.response.data.hasOwnProperty('error')) {
        throw new AuthenticationError(error.response.data.error_description, { status: error_status, code: error.code, cause: error});
      }
    }
  }

  async createUser(name, email) {
    return this.sendRequest('/users/create', { name, email }, 'user');
  }
  
  async getUser(id) {
    return this.sendRequest('/users/fetch', { id }, 'user');
  }

  async getUserAchievements(id) {
    return this.sendRequest('/users/achievements', { id }, 'achievements');
  }

  async getCategoryTemplateVersions(categoryId) {
    return this.sendRequest('/categories/template_versions', { id: categoryId }, 'template_versions');
  }

  async awardAchievement(templateVersionId, userId) {
    return this.sendRequest('/achievements/award', { template_version_id: templateVersionId, user_id: userId }, 'achievement');
  }

  async authenticate() {
    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    try {
      const response = await axios.post(`${this.apiUrl}${this.authPath}`, body, { headers: { 'Content-Type': 'application/json' } });
      const responseData = response.data;
      this.token = responseData.access_token;
      this.expiresAt = new Date(Date.now() + responseData.expires_in * 1000);
      this.tokenType = responseData.token_type;
    } catch(error) {
      if(['ECONNREFUSED', 'ENOTFOUND'].includes(error.code)) {
        throw new AuthenticationError(`Invalid API URL: ${this.apiUrl}`, { status: error.errno, code: error.code, cause: error});
      }
      const error_status = error.response.status
      if([400, 404, 403].includes(error_status)) {
        throw new AuthenticationError(`Invalid API URL: ${this.apiUrl}`, { status: error_status, code: error.code, cause: error});
      }

      if(error.response.data.hasOwnProperty('error')) {
        throw new AuthenticationError(error.response.data.error_description, { status: error_status, code: error.code, cause: error});
      }
    }
  }

  async refreshToken() {
    if(this.authPromise) {
      await this.authPromise;
      this.authPromise = null;
    }
    if (!this.expiresAt || new Date() > this.expiresAt) {
      await this.authenticate();
    }
  }
}
