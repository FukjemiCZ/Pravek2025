import PaymentWidget from "./components/payment-widget";
//import DogsList from "./components/dogs-list;

export default function PortalPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Můj portál</h1>

      <PaymentWidget />

      <div style={{ marginTop: "3rem" }}>
        <h2>Moji psi</h2>
        {/* <DogsList /> */}
      </div>
    </div>
  );
}
