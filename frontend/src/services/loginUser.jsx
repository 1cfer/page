export default async function loginUser({ email, password }) {
  const response = await fetch('/v1/auth/tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  localStorage.setItem('user', email);
  localStorage.setItem('password', password);
  localStorage.setItem('access_token', response.headers.get('x-subject-token'));

  return response.json();
}
