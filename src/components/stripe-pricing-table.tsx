import * as React from 'react';
import Navigation from './navigation'

declare global {
  namespace JSX {
      interface IntrinsicElements {
          "stripe-pricing-table": React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      }
  }
}

function PricingPage() {
  // Paste the stripe-pricing-table snippet in your React component
  return (
    <>
        <Navigation />
        <stripe-pricing-table pricing-table-id="prctbl_1MXVSXSCwGmnQ6huFAv7VvYV"
        publishable-key="pk_test_51MXUxYSCwGmnQ6hudb18WywoaOkk4XF1AIFKwMJGxIKbzno94qOGTUt9iL0nGkQd8D1SHqSVWhAwYJcSgXgzvDyB00lauzMZ93">
        </stripe-pricing-table>
    </>
  );
}

export default PricingPage;