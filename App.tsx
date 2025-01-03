import {useEffect} from 'react';
import {Button, View} from 'react-native';
import * as RNIap from 'react-native-iap';

RNIap.setup({storekitMode: 'STOREKIT2_MODE'});

async function logSubscriptionsDetails() {
  let activeSubscriptionsCount = 0;

  // Fetch the product, otherwise `getAvailablePurchases` will return an empty array
  await RNIap.getProducts({skus: ['premium_one_month', 'premium_six_months']});

  for (const purchase of await RNIap.getAvailablePurchases({
    onlyIncludeActiveItems: true,
  })) {
    const entitledPurchase = await RNIap.IapIosSk2.currentEntitlement(purchase.productId);
    const expirationDate = new Date(entitledPurchase.expirationDate);

    const subscriptionStatus = await RNIap.IapIosSk2.subscriptionStatus(purchase.productId);
    const isSubscribed = subscriptionStatus.some(status => status.state === 'subscribed');

    if (isSubscribed && expirationDate.getTime() > Date.now()) {
      activeSubscriptionsCount++;
      logSubscriptionDetails(purchase.productId, expirationDate, entitledPurchase.offerID);
    }
  }

  if (activeSubscriptionsCount === 0) {
    console.log('User has no active subscriptions');
  }
}

function logSubscriptionDetails(productId: string, expirationDate: Date, offerId?: string) {
  console.log(`User has an active subscription for ${productId}`);
  console.log(`Subscription will expire at ${expirationDate.toLocaleString()}`);

  if (typeof offerId === 'string') {
    console.log(`User subscribed with offer ID ${offerId}`);
  }
}

function App() {
  useEffect(() => {
    logSubscriptionsDetails();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Get Subscription Details" onPress={logSubscriptionsDetails} />
      {/* Use this to finish purchases made through xcode Transaction Manager */}
      <Button title="Clear transactions" onPress={RNIap.clearTransactionIOS} />
    </View>
  );
}

export default App;
