document.addEventListener('DOMContentLoaded', async () => {
    /* Load the publishable key from the server. for now hard coding it.
    const {publishableKey} = await fetch(
        'http://localhost:7000/api/publishableKey',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      ).then((r) => r.json());
    */
    const publishableKey = "STRIPE_PUBLISHABLE_KEY"
    let clientSecret;
    const stripe = Stripe(publishableKey, {
      apiVersion: '2020-08-27',
    });
  
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');
    // When the form is submitted...
    const form = document.getElementById('payment-form');
    const secretForm = document.getElementById('secret-form');
    let submitted = false;
    let secretSubmitted = false;
    

    secretForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Disable double submission of the form
      if(secretSubmitted) { return; }
      secretSubmitted = true;
      secretForm.querySelector('button').disabled = true;
      let clientSecretInput = document.querySelector('#clientSecret');
      clientSecret = clientSecretInput.value;

    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      if(submitted) { return; }
  
      if(clientSecret !== undefined || clientSecret !==null) {
           addMessage(`Client secret available `);
           submitted = true;
           form.querySelector('button').disabled = true;
      }else{
        addMessage(`Client secret not available `);
        return;
      }

      const nameInput = document.querySelector('#name');
  
      // Confirm the card payment given the clientSecret
      // from the payment intent that was just created on
      // the server.

      const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: nameInput.value,
            },
          },
        }
      );
  
      if (stripeError) {
        addMessage(stripeError.message);
        // reenable the form.
        submitted = false;
        form.querySelector('button').disabled = false;
        return;
      }
      addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    });
  });