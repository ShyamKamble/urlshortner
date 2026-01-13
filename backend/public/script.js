const submitbutton = document.querySelector('#submit');
const pricing = document.querySelector('.btntoprice')


pricing.addEventListener('click', (event) => {
  window.location.href = `/pricing.html`;
})
const urlsubmitbtn = document.querySelector('.urlbtn');
urlsubmitbtn.addEventListener('click', (e) => {
  e.preventDefault();
  const userurl = document.querySelector('.userinput').value;

  fetch('/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl: userurl })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Short URL:', data.shortUrl);
      document.querySelector('.result').textContent=data.shortUrl
    })
    .catch(error => console.error('Error:', error));
})
submitbutton.addEventListener('click', (event) => {
  event.preventDefault(); // stop form refresh
  const form = document.querySelector('form');
  const first_name = document.querySelector('#first_name').value;
  const last_name = document.querySelector('#last_name').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Response data:', data);
      console.log('About to redirect to home.html');
      // Clear form fields
      document.querySelector('#first_name').value = '';
      document.querySelector('#last_name').value = '';
      document.querySelector('#email').value = '';
      document.querySelector('#password').value = '';

      // Always redirect to home page
      window.location.href = '/home.html';
      console.log('Redirect command executed');
    })
    .catch(error => {
      console.error('Error:', error);
      // Redirect even if there's an error
      window.location.href = '/home.html';
    });
});