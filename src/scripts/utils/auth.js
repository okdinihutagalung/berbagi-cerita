export const Auth = {
  getToken(){
    return localStorage.getItem('story_token') || null;
  },
  setToken(token){
    localStorage.setItem('story_token', token);
  },
  clear(){
    localStorage.removeItem('story_token');
    localStorage.removeItem('story_user');
  },
  setUser(user){
    localStorage.setItem('story_user', JSON.stringify(user));
  },
  getUser(){
    const u = localStorage.getItem('story_user');
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn(){
    return !!this.getToken();
  }
}
