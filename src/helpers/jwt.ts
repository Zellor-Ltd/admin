import jwtDecode from 'jwt-decode';

const jwt = {
  decode(token: string) {
    try {
      return jwtDecode(token);
    } catch (erro) {}
  },
};
export default jwt;
