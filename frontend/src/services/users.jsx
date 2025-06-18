export async function createUser({ userName, email, password }) {
  const response = await fetch('/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-token': localStorage.getItem('access_token'),
    },
    body: JSON.stringify({
      user: {
        username: userName,
        email,
        password,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}

export async function getUsers() {
  const response = await fetch('/v1/users', {
    method: 'GET',
    headers: {
      'X-Auth-token': localStorage.getItem('access_token'),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get users');
  }

  return response.json();
}
