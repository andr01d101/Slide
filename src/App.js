import React from 'react';

class App extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  initEventHandlers(container) {
    // remove all old handlers for case when dialog is reopened to avoid double handling
    container.off();

    container.on('portalOne.load', function () {
      console.log('portalOne.load event raised');
    });

    container.on('portalOne.paymentComplete', function (e, data) {
      console.log('portalOne.paymentComplete event raised');
      console.log('portalOne.paymentComplete transactionId : ' + data.transactionId);
      console.log('portalOne.paymentComplete saved payment token : ' + data.tokenId);
    });

    container.on('portalOne.error', function (e, data) {
      alert(data.Description);
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.getCustomerId("DanTar1").then(custId => {
      fetch('https://stgportalone.processonepayments.com/API/api/Session/Create?portalOneAuthenticationKey=F809D1B7-A8AB-4611-AEBD-7958541509E0&CustomerId=' + custId)
        .then(response => response.json())
        .then(data => {
          let container = window.$('#portalOneContainer');
          container.portalOne();
          this.initEventHandlers(container);
          let dialog = container.data('portalOne');
          //This information would come from carrier's system
          dialog.makePayment({
            'paymentCategory': 'CreditCard',
            'feeContext': 'PaymentWithFee',
            'convenienceFeeType': 'Renewal',
            'amountContext': 'SelectOrEnterAmount',
            'minAmountDue': '12.00',
            'accountBalance': '120.00',
            'billingZip': '95630',
            'billingAddressStreet': '602 Coolidge Dr., Folsom, CA',
            'policyHolderName': 'John Smith',
            'clientReferenceData1': 'POL330701-02',
            'confirmationDisplay': 'true',
            'saveOption': 'Save',
            'sessionId': data.PortalOneSessionKey,
            'customerId' : data.custId
          });
        });
    })

  }
  
   getCustomerId(customerName) {
    return new Promise((resolve, reject) => {
      //Check to see if customerID exists in carrier system. If not, create one.
      //Note the POST body information could either be pulled from the UI or from
      //carrier backend depending on the UI design.
      var customerIDExists = false;  //Replace this with a call to customer database
      var customerId = "";
      if (customerIDExists) {
        customerId = "f6e5504f-5707-408d-ad66-f6b3e52fc29a";
        resolve(customerId);
      } else {
        const options = {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            PortalOneAuthenticationKey: 'F809D1B7-A8AB-4611-AEBD-7958541509E0',
            ExternalCustomerId: 'customer12345',
            CustomerName: customerName
          })
        };

        fetch('https://stgportalone.processonepayments.com/Api/Api/Customer/CreateAccount', options)
          .then(response => response.json())
          .then(response => resolve(response.CustomerId))
          .catch(err => console.error(err));
      }
    })
  }

  render() { 
    return (
      <div>
        <h1>Payment Center</h1>
        <form onSubmit={this.handleSubmit}>
          Customer name
          <input type="text" name="name" />
          <button>Pay Now</button>
        </form>
        <div id="portalOneContainer"></div>
      </div>
    );
  }
}

export default App;

