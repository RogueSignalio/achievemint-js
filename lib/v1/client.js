import axios from 'axios';

export class Client {
  constructor(clientId, clientSecret, url, authPath='/oauth/token') {
    this.apiUrl = url;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authPath = authPath;
    this.pathVersion ='/api/v1';

    this.authenticate();
  }

  async sendRequest(path, params, responseObj) {
    await this.refreshToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `${this.tokenType} ${this.token}`
    };
    const response = await axios.post(`${this.apiUrl}${this.pathVersion}${path}`, params, { headers });
    const responseData = response.data;
    if(responseData[responseObj]) {
      return responseData[responseObj];
    } else {
      return responseData;
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
    const response = await axios.post(`${this.apiUrl}${this.authPath}`, body, { headers: { 'Content-Type': 'application/json' } });
    const responseData = response.data;
    this.token = responseData.access_token;
    this.expiresAt = new Date(Date.now() + responseData.expires_in * 1000);
    this.tokenType = responseData.token_type;
  }

  async refreshToken() {
    if (!this.expiresAt || new Date() > this.expiresAt) {
      await this.authenticate();
    }
  }
}
