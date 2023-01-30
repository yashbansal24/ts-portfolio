import { Modal, useModal, Button, Text, Spacer, Link } from "@nextui-org/react";

export default function Projects(props) {
  return (
    <div>
      <Modal
        scroll
        width="600px"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        {...props.bindings2}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Experience
          </Text>
        </Modal.Header>
        <Modal.Body>
        <Text h4 id="modal-description">
            Projects
        </Text>
          <Text h6 id="modal-description">
            
            - Trading Econmics - Use Events API to fetch all latest calendar events and notify in calendar. 
            <Link isExternal href="https://tradingeconomics.vercel.app/"></Link>
            <Spacer/>
            - Using AWS via terraform to deploy and containerisation using docker and kubernetes. Working with a combination of SQL and noSQL(DynamoDB, mongoDB) to generate high throughput and low latency systems (&gt; 15 million reads per second).
          </Text>
          <Text h4 id="modal-description">
            PayPal Senior Software Engineer
        </Text>
          <Text h6 id="modal-description">
            - Implemented token based rate limiting system to block malicious calls using redis and remote configs. Currently blocks almost 500k callers daily.
            <Spacer/>
            - Launched 5 different payment experiments which were being used by more than 1 million people every day. A/B experiments were used to ramp control. Application server is based on NodeJS.
            <Spacer/>
            - Single handedly created a RTL friendly experience. Updated all components to be accessible on the mobile web.
            <Spacer/>
            - Single handedly implemented guest estimate buyerview on the new web experience. 100k pageviews per day.
            <Spacer/>
            - Developed all the item flows (creating/editing) on the mobile web(Reactjs) based application. Increase from 30% to 55% in mobile conversion to invoice was noticed with mweb launch.
            <Spacer/>
            - Involved in architectural design of Application with focus on networking, rendering and javascript performance. Splitting the bundles, caching, lazy loading of components and reducing TTFB were part of the primary focus.
            <Spacer/>
            - Implemented HIPAA compliance requirement measures to all different versions of application. This involved creating multiple new REST endpoints and making significant changes in DB. API usage - 1.5+ million per day.
            <Spacer/>
            - Involved in setting up end to end testing using cypress, unit testing with mocha/jest and REST endpoint testing with Postman and newman. Integration of qualtrics feedback mechanism in all the 3 versions of the application.
            <Spacer/>
            - Received award for most patents filed in 2019-20. Involved in mentoring and helping other junior developers in my team. Involved in taking informative sessions and career guidance sessions intermittently in public colleges.
            <Spacer/>
            - Launched various promotions on the invoicing web app contributing to around 20,000 people clicking on those promotions every day.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={() => props.setVisible(false)}>
            Close
          </Button>
          <Button auto onPress={() => props.setVisible(false)}>
            Agree
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
