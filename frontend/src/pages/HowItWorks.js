import BackButton from "../components/BackButton";
import "../resources/howItWorks.css";
function HowItWorks() {
  const steps = [
    {
      src: "/images/rent.png",
      title: "Rent Cars",
      description:
        "Every time you rent a car, you earn points based on the rental amount.",
    },
    {
      src: "images/loyalty-how-it-works.png",
      title: "Earn & Track Points ",
      description:
        "Easily monitor your points balance in your account dashboard.",
    },
    {
      src: "/images/rewards.png",
      title: "Get Rewards",
      description: `Use your points to claim discount vouchers for your next rental.`,
    },
  ];
  return (
    <div className="how-it-works-page">
      <div>
        <BackButton />

        <div className="how-it-works-text">
          <h3>How It Works </h3>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div className="step-container" key={index}>
                <img src={step.src} className="images" alt={step.title} />
                <h3>{`${index + 1}. ${step.title}`}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
          <h3>Why Join? </h3>
          <ul>
            <li>Save more with every rental.</li>
            <li>Enjoy exclusive discounts and perks.</li>
            <li>It's free to join and easy to use!</li>
          </ul>
          <h3>Points to Discounts Conversion</h3>
          Earn up to 40% off on your rentals by accumulating points!
          <ul>
            <li>10,000 Points = 10% Discount</li>
            <li>20,000 Points = 20% Discount</li>

          </ul>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
