const pay = document.getElementById("pay");

pay.addEventListener("click", () => {
  const stripeAccount = document.getElementById("account").value;
  fetch("http://localhost:5001/api/v1/user/add/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3MTU2OTY0MzAsImV4cCI6MTcxODI4ODQzMH0.qEJl3c_twxYYjEX-xM_cUxFSUjCQFICPStkETvm5SLY",
    },
    body: JSON.stringify({
      type: "Dine-in",
      tip: 0.5,
    }),
  })
    .then((response) => response.json())
    .then((order) => {
      const stripe = Stripe(
        "pk_test_51OwnJm067vf7BB5cfmdS62RbG5jlQ372SI0sdhTLl5YazFYAWdSEg3kjnMeIDvzKIC9r45uBBurbwVGjLuFlRlBs007nCMMh1P"
      );
      stripe
        .redirectToCheckout({
          sessionId: order.stripe_chekout_session_id,
          stripeAccount: stripeAccount,
        })
        .then((result) => {
          if (result.error) {
            console.error(result.error.message);
          }
        });
    })
    .catch((err) => console.error(err));
});
