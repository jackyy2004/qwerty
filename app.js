const { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } = ReactRouterDOM;

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key, defaultValue) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
}

const DataContext = React.createContext();

function DataProvider({ children }) {
  const [dishes, setDishes] = React.useState(load('dishes', [
    { id: 1, name: 'Phở bò', price: 45000, image: 'https://via.placeholder.com/150', rating: 4.5 },
    { id: 2, name: 'Bún chả', price: 40000, image: 'https://via.placeholder.com/150', rating: 4.0 },
    { id: 3, name: 'Bánh mì', price: 20000, image: 'https://via.placeholder.com/150', rating: 5.0 }
  ]));

  const [users, setUsers] = React.useState(load('users', [{ id: 1, username: 'admin', password: 'admin', role: 'admin' }]));
  const [currentUser, setCurrentUser] = React.useState(load('currentUser', null));
  const [cart, setCart] = React.useState(load('cart', []));
  const [orders, setOrders] = React.useState(load('orders', []));
  const [reviews, setReviews] = React.useState(load('reviews', []));

  React.useEffect(() => { save('dishes', dishes); }, [dishes]);
  React.useEffect(() => { save('users', users); }, [users]);
  React.useEffect(() => { save('currentUser', currentUser); }, [currentUser]);
  React.useEffect(() => { save('cart', cart); }, [cart]);
  React.useEffect(() => { save('orders', orders); }, [orders]);
  React.useEffect(() => { save('reviews', reviews); }, [reviews]);

  const value = {
    dishes, setDishes,
    users, setUsers,
    currentUser, setCurrentUser,
    cart, setCart,
    orders, setOrders,
    reviews, setReviews
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function Navbar() {
  const { currentUser, setCurrentUser, cart } = React.useContext(DataContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">FoodApp</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/menu">Menu</Link></li>
            {currentUser && (
              <li className="nav-item"><Link className="nav-link" to="/orders">Orders</Link></li>
            )}
            <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
            {currentUser && currentUser.role === 'admin' && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
            )}
          </ul>
          <ul className="navbar-nav">
            {currentUser ? (
              <>
                <li className="nav-item"><span className="nav-link">Hello, {currentUser.username}</span></li>
                <li className="nav-item"><button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button></li>
                <li className="nav-item"><Link className="nav-link" to="/cart">Cart ({cart.length})</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="container container-section">
      <h2>Welcome to FoodApp</h2>
      <p>Choose your favorite dishes from our menu.</p>
    </div>
  );
}

function Menu() {
  const { dishes, cart, setCart, reviews } = React.useContext(DataContext);
  const addToCart = (dish) => {
    setCart([...cart, { ...dish, quantity: 1 }]);
  };
  return (
    <div className="container container-section">
      <div className="row">
        {dishes.map(dish => (
          <div className="col-md-4" key={dish.id}>
            <div className="card mb-3">
              <img src={dish.image} className="card-img-top" alt={dish.name} />
              <div className="card-body">
                <h5 className="card-title">{dish.name}</h5>
                <p className="card-text">Price: {dish.price} VND</p>
                <p className="card-text">Rating: {dish.rating}</p>
                <button className="btn btn-primary me-2" onClick={() => addToCart(dish)}>Add to Cart</button>
                <Link to={`/reviews/${dish.id}`} className="btn btn-secondary">View Reviews</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cart() {
  const { cart, setCart, orders, setOrders } = React.useContext(DataContext);
  const navigate = useNavigate();

  const updateQuantity = (index, qty) => {
    const newCart = [...cart];
    newCart[index].quantity = qty;
    setCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const checkout = () => {
    const order = { id: Date.now(), items: cart, date: new Date().toLocaleString() };
    setOrders([...orders, order]);
    setCart([]);
    navigate('/orders');
  };

  if (cart.length === 0) return <div className="container container-section"><h3>Your cart is empty.</h3></div>;

  return (
    <div className="container container-section">
      <h3>Your Cart</h3>
      <ul className="list-group mb-3">
        {cart.map((item, idx) => (
          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {item.name} - {item.price} VND
            </div>
            <div>
              <input type="number" min="1" value={item.quantity} onChange={e => updateQuantity(idx, Number(e.target.value))} style={{ width: '60px' }} />
              <button className="btn btn-sm btn-danger ms-2" onClick={() => removeItem(idx)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn btn-success" onClick={checkout}>Checkout</button>
    </div>
  );
}

function Orders() {
  const { orders } = React.useContext(DataContext);
  if (orders.length === 0) return <div className="container container-section"><h3>No orders yet.</h3></div>;
  return (
    <div className="container container-section">
      <h3>Your Orders</h3>
      {orders.map(order => (
        <div key={order.id} className="mb-3">
          <h5>Order {order.id} - {order.date}</h5>
          <ul className="list-group">
            {order.items.map((item, idx) => (
              <li key={idx} className="list-group-item">
                {item.name} x {item.quantity} - {item.price * item.quantity} VND
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Contact() {
  return (
    <div className="container container-section">
      <h3>Contact Us</h3>
      <form onSubmit={e => e.preventDefault()}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea className="form-control" rows="3" required></textarea>
        </div>
        <button className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}

function Login() {
  const { users, setCurrentUser } = React.useContext(DataContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="container container-section">
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input name="username" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" name="password" className="form-control" required />
        </div>
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  );
}

function Register() {
  const { users, setUsers } = React.useContext(DataContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    if (users.some(u => u.username === username)) {
      alert('User exists');
      return;
    }
    const newUser = { id: Date.now(), username, password, role: 'user' };
    setUsers([...users, newUser]);
    alert('Registered! Please login.');
    navigate('/login');
  };

  return (
    <div className="container container-section">
      <h3>Register</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input name="username" className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" name="password" className="form-control" required />
        </div>
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  );
}

function Reviews({ dishId }) {
  const { reviews, setReviews, currentUser } = React.useContext(DataContext);
  const dishReviews = reviews.filter(r => r.dishId === dishId);

  const addReview = (e) => {
    e.preventDefault();
    const content = e.target.content.value;
    const stars = Number(e.target.stars.value);
    setReviews([...reviews, { id: Date.now(), dishId, user: currentUser.username, content, stars }]);
    e.target.reset();
  };

  return (
    <div className="container container-section">
      <h3>Reviews</h3>
      {dishReviews.length === 0 && <p>No reviews.</p>}
      <ul className="list-group mb-3">
        {dishReviews.map(r => (
          <li key={r.id} className="list-group-item">
            <strong>{r.user}</strong>: {r.content} ({r.stars}⭐)
          </li>
        ))}
      </ul>
      {currentUser && (
        <form onSubmit={addReview}>
          <div className="mb-3">
            <label className="form-label">Review</label>
            <textarea name="content" className="form-control" required></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Stars</label>
            <select name="stars" className="form-select">
              {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}

function ReviewPage() {
  const params = ReactRouterDOM.useParams();
  return <Reviews dishId={Number(params.id)} />;
}

function Admin() {
  const { currentUser } = React.useContext(DataContext);
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return (
    <div className="container container-section">
      <h3>Admin Dashboard</h3>
      <ul className="list-group">
        <li className="list-group-item"><Link to="manage-dishes">Manage Dishes</Link></li>
        <li className="list-group-item"><Link to="manage-users">Manage Users</Link></li>
        <li className="list-group-item"><Link to="manage-reviews">Manage Reviews</Link></li>
        <li className="list-group-item"><Link to="view-orders">View Orders</Link></li>
      </ul>
      <Routes>
        <Route path="manage-dishes" element={<ManageDishes />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="manage-reviews" element={<ManageReviews />} />
        <Route path="view-orders" element={<ViewOrders />} />
      </Routes>
    </div>
  );
}

function ManageDishes() {
  const { dishes, setDishes } = React.useContext(DataContext);
  const [form, setForm] = React.useState({ name: '', price: '', image: '', rating: '' });

  const addDish = (e) => {
    e.preventDefault();
    const newDish = { id: Date.now(), ...form, price: Number(form.price), rating: Number(form.rating) };
    setDishes([...dishes, newDish]);
    setForm({ name: '', price: '', image: '', rating: '' });
  };

  const deleteDish = (id) => {
    setDishes(dishes.filter(d => d.id !== id));
  };

  return (
    <div className="mt-3">
      <h5>Add Dish</h5>
      <form onSubmit={addDish} className="mb-3">
        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
        <input className="form-control mb-2" placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price:e.target.value})} required />
        <input className="form-control mb-2" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image:e.target.value})} required />
        <input className="form-control mb-2" placeholder="Rating" type="number" value={form.rating} onChange={e => setForm({...form, rating:e.target.value})} required />
        <button className="btn btn-primary" type="submit">Add</button>
      </form>
      <ul className="list-group">
        {dishes.map(d => (
          <li key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
            {d.name}
            <button className="btn btn-sm btn-danger" onClick={() => deleteDish(d.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManageUsers() {
  const { users, setUsers } = React.useContext(DataContext);
  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };
  return (
    <div className="mt-3">
      <h5>Users</h5>
      <ul className="list-group">
        {users.map(u => (
          <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
            {u.username} ({u.role})
            {u.role !== 'admin' && <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManageReviews() {
  const { reviews, setReviews } = React.useContext(DataContext);
  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };
  return (
    <div className="mt-3">
      <h5>Reviews</h5>
      <ul className="list-group">
        {reviews.map(r => (
          <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
            {r.user}: {r.content}
            <button className="btn btn-sm btn-danger" onClick={() => deleteReview(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ViewOrders() {
  const { orders } = React.useContext(DataContext);
  if (orders.length === 0) return <p className="mt-3">No orders.</p>;
  return (
    <div className="mt-3">
      {orders.map(order => (
        <div key={order.id} className="mb-3">
          <h5>Order {order.id} - {order.date}</h5>
          <ul className="list-group">
            {order.items.map((item, idx) => (
              <li key={idx} className="list-group-item">
                {item.name} x {item.quantity} - {item.price * item.quantity} VND
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reviews/:id" element={<ReviewPage />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
        <footer>FoodApp &copy; 2023</footer>
      </DataProvider>
    </BrowserRouter>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
