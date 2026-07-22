const seed = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin',
        email: 'admin@vault.com',
        password: 'password123',
        code: 'vault123'
      })
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
};
seed();
