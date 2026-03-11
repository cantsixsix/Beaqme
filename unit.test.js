


/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.resolve(__dirname, '../index.html');

describe('Beaqme App Logic', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Read the HTML file
    let htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

    // Inject a mock for AOS (Animate On Scroll) before the script runs to prevent errors
    // and mock window.scrollTo which isn't implemented in JSDOM
    const mocks = `
      <script>
        window.AOS = { init: () => {} };
        window.HTMLElement.prototype.scrollTo = () => {};
      </script>
    `;
    htmlContent = htmlContent.replace('<head>', `<head>${mocks}`);

    // Initialize JSDOM with the HTML content
    // runScripts: "dangerously" allows the embedded <script> tags to execute
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost'
    });

    window = dom.window;
    document = window.document;

    // Mock global timers for setTimeout used in auth functions
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe('Utilities', () => {
    test('isAdmin() correctly identifies the admin email', () => {
      // Access the function exposed globally on the window
      expect(window.isAdmin('ederlanbritoctt@gmail.com')).toBe(true);
      expect(window.isAdmin('EDERLANBRITOCtt@gmail.com')).toBe(true); // Case insensitive check
      expect(window.isAdmin('user@example.com')).toBe(false);
    });
  });

  describe('Authentication', () => {
    test('handleSignup() creates a new user and sets session', () => {
      const name = 'New User';
      const email = 'newuser@test.com';
      const password = 'password123';

      // Fill the signup form
      document.getElementById('signupName').value = name;
      document.getElementById('signupEmail').value = email;
      document.getElementById('signupPass').value = password;
      document.getElementById('signupPass2').value = password;

      // Mock event
      const event = { preventDefault: jest.fn() };

      // Execute signup
      window.handleSignup(event);
      
      // Fast-forward the loading setTimeout
      jest.runAllTimers();

      // Verify localStorage "bq_users"
      const users = JSON.parse(window.localStorage.getItem('bq_users'));
      const createdUser = users.find(u => u.email === email);
      
      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe(name);
      expect(createdUser.password).not.toBe(password); // Should be encoded

      // Verify localStorage "bq_session"
      const session = JSON.parse(window.localStorage.getItem('bq_session'));
      expect(session.email).toBe(email);
    });

    test('handleLogin() logs in successfully with valid credentials', () => {
      // Pre-seed a user in localStorage
      const email = 'existing@test.com';
      const password = 'securePass';
      const users = [{ name: 'Existing', email, password: window.btoa(password) }];
      window.localStorage.setItem('bq_users', JSON.stringify(users));

      // Fill login form
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPass').value = password;

      const event = { preventDefault: jest.fn() };
      window.handleLogin(event);
      jest.runAllTimers();

      // Check if session exists
      const session = JSON.parse(window.localStorage.getItem('bq_session'));
      expect(session).not.toBeNull();
      expect(session.email).toBe(email);
    });

    test('handleLogin() shows error with invalid credentials', () => {
      // Seed user
      const email = 'existing@test.com';
      const users = [{ name: 'Existing', email, password: window.btoa('correct') }];
      window.localStorage.setItem('bq_users', JSON.stringify(users));

      // Fill login form with WRONG password
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPass').value = 'wrong';

      const event = { preventDefault: jest.fn() };
      window.handleLogin(event);

      // Verify error message display
      const errorEl = document.getElementById('loginError');
      expect(errorEl.style.display).toBe('block');
      
      // Verify no session was created
      const session = JSON.parse(window.localStorage.getItem('bq_session'));
      expect(session).toBeNull();
    });
  });

  describe('Chat System', () => {
    test('sendMessage() adds user message to local storage', () => {
      // Simulate logged in user
      const email = 'chatter@test.com';
      window.localStorage.setItem('bq_session', JSON.stringify({ name: 'Chatter', email }));
      
      // Input message
      const input = document.getElementById('chatInput');
      input.value = 'Hello Beaqme!';

      // Send
      window.sendMessage();

      // Verify storage
      const chats = JSON.parse(window.localStorage.getItem('bq_chats'));
      const thread = chats[email];
      
      expect(thread).toBeDefined();
      expect(thread).toHaveLength(1);
      expect(thread[0].text).toBe('Hello Beaqme!');
      expect(thread[0].isAdmin).toBe(false);
    });
  });
});
