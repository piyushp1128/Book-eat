document.addEventListener('DOMContentLoaded', function () {
  // Load cart from localStorage
  let cart = {};
  const savedCart = localStorage.getItem('bookEatCart');

  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      populateOrderSummary(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      showEmptyState();
    }
  } else {
    showEmptyState();
  }

  // Generate random order number
  const orderNumber = document.getElementById('order-number');
  orderNumber.textContent = 'VIT' + Math.floor(Math.random() * 10000);

  // Handle Pay Now button click
  const payNowBtn = document.getElementById('pay-now-btn');
  payNowBtn.addEventListener('click', function () {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Get total amount
    const totalAmount = parseFloat(
      document.querySelector('.total-amount').textContent.replace('₹', '')
    );

    // Initialize Razorpay payment
    initRazorpay(totalAmount);
  });

  // Function to populate order summary
  function populateOrderSummary(cart) {
    const orderItemsContainer = document.querySelector('.order-items');
    const subtotalElement = document.querySelector('.subtotal-amount');
    const discountElement = document.querySelector('.discount-amount');
    const taxElement = document.querySelector('.tax-amount');
    const totalElement = document.querySelector('.total-amount');
    const payAmountElement = document.querySelector('.pay-amount');

    // Clear current items
    orderItemsContainer.innerHTML = '';

    // Calculate totals
    let subtotal = 0;

    // Add items to order summary
    for (const itemId in cart) {
      const item = cart[itemId];
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const orderItemHTML = `
                <div class="order-item d-flex justify-content-between align-items-center mb-2">
                    <div class="item-quantity fw-bold">${item.quantity}x</div>
                    <div class="item-details flex-grow-1 ms-2">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">₹${item.price.toFixed(2)} × ${item.quantity}</div>
                    </div>
                    <div class="item-total fw-bold">₹${itemTotal.toFixed(2)}</div>
                </div>
            `;

      orderItemsContainer.innerHTML += orderItemHTML;
    }

    // Calculate additional charges
    const discount = subtotal * 0.1;
    const deliveryFee = 1.5;
    const tax = (subtotal - discount + deliveryFee) * 0.05;
    const total = subtotal - discount + deliveryFee + tax;

    // Update summary
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    discountElement.textContent = `-₹${discount.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    payAmountElement.textContent = `₹${total.toFixed(2)}`;

    // Show empty state if needed
    if (Object.keys(cart).length === 0) {
      showEmptyState();
    }
  }

  // Function to show empty state
  function showEmptyState() {
    const orderItemsContainer = document.querySelector('.order-items');
    orderItemsContainer.innerHTML = `
            <div class="empty-state text-center p-4">
                <p>Your cart is empty. Please add items to your cart before checkout.</p>
                <a href="vit-menu.html" class="btn btn-primary">Back to Menu</a>
            </div>
        `;

    // Disable pay now button
    const payNowBtn = document.getElementById('pay-now-btn');
    payNowBtn.disabled = true;
    payNowBtn.style.opacity = '0.5';
    payNowBtn.style.cursor = 'not-allowed';
  }

  // Function to validate form
  function validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!name || !phone || !email || !address) {
      alert('Please fill in all required fields');
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }

    // Simple phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  }

  // Function to initialize Razorpay payment and handle success
  function initRazorpay(amount) {
    const amountInPaise = Math.round(amount * 100);

    // Get customer details
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    // Prepare cart items for backend
    const cartItems = Object.keys(cart).map((key) => {
      const item = cart[key];
      // Use item.id if available, otherwise parse key as number
      // (but ideally, your cart should always have item.id as a number)
      const foodId = item.id ? parseInt(item.id, 10) : parseInt(key, 10);
      if (isNaN(foodId)) {
        console.error('Invalid foodId in cart:', item);
        return null;
      }
      return {
        foodId: foodId,
        quantity: item.quantity,
        price: item.price,
      };
    }).filter(item => item !== null); // Filter out invalid items

    // Prepare order data for backend
    const orderData = {
      customerName: name,
      phone: phone,
      email: email,
      address: document.getElementById('address').value.trim(),
      notes: document.getElementById('notes').value.trim(),
      cartItems: cartItems,
    };

    // Debug: log the data being sent
    console.log('Order data to send:', orderData);

    const options = {
      key: 'rzp_test_LerHhmnSru6RuL', // Replace with your Razorpay key
      amount: amountInPaise,
      currency: 'INR',
      name: 'Book-Eat',
      description: 'Food Order Payment',
      handler: async function (response) {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);

        try {
          const res = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          if (!res.ok) {
            const errorData = await res.json();
            alert('Failed to save order: ' + (errorData.error || 'Unknown error'));
            return;
          }

          const result = await res.json();
          console.log('Order saved with ID:', result.orderId);

          // Clear cart and redirect
          localStorage.removeItem('bookEatCart');
          window.location.href = './payment-status/payment-successful.html';
        } catch (error) {
          alert('Error saving order: ' + error.message);
          console.error(error);
        }
      },
      prefill: {
        name: name,
        email: email,
        contact: phone,
      },
      theme: {
        color: '#00C853',
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  // Optional: Add animation to payment option (if multiple payment options exist)
  const paymentOption = document.querySelector('.payment-option');
  if (paymentOption) {
    paymentOption.addEventListener('click', function () {
      this.classList.add('selected');
    });
  }
});
