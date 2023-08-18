const API_HOST = process.env.API_HOST;
const API_KEY = process.env.API_KEY;

const fetchApi = (url, method, headers, body) => {
  return fetch(`${API_HOST}/${url}/`, {
    method,
    headers: {
        "x_authorization": `Basic ${API_KEY}`,
        ...headers,
    },
    body
  });
}

export default fetchApi;
