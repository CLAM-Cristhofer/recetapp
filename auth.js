const Auth = {
  USER_KEY: 'recetapp_user',

  login(username) {
    const user = { username: username.trim(), createdAt: Date.now() };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.USER_KEY));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return this.getUser() !== null;
  },

  logout() {
    localStorage.removeItem(this.USER_KEY);
  },

  getUsername() {
    const user = this.getUser();
    return user ? user.username : '';
  }
};
