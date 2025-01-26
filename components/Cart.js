import React from 'react';

function Cart({ items, removeFromCart }) {
  return (
    <div>
      <h2>Shopping Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="list-group">
          {items.map(item => (
            <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
              {item.name} - ${item.price.toFixed(2)}
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;