async function test() {
  try {
    // 1. Login to get token
    const loginRes = await fetch("http://localhost:5000/api/v1/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@example.com",
        password: "password123",
      }),
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error("Login failed: " + loginData.error);
    const token = loginData.token;
    console.log("Login success. Token length:", token.length);

    // 2. Get a product ID
    const prodRes = await fetch("http://localhost:5000/api/v1/products");
    const prodData = await prodRes.json();
    const productId = prodData.data[0]._id;
    console.log("Product ID:", productId);

    // 3. Add to cart
    const addRes = await fetch("http://localhost:5000/api/v1/products/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        quantity: 1,
      }),
    });
    const addData = await addRes.json();

    console.log("Add to cart result:", addData);

    // 4. Get cart
    const cartRes = await fetch("http://localhost:5000/api/v1/products/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartData = await cartRes.json();
    console.log("Get cart success:", cartData);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
